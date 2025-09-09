import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res)
  if (!session) return

  switch (req.method) {
    case 'GET':
      return await getUserSpotlights(req, res, session.user.id)
    case 'DELETE':
      return await cancelSpotlight(req, res, session.user.id)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getUserSpotlights(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      status = 'all',
      page = 1,
      limit = 20
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = Math.min(parseInt(limit as string), 50)
    const offset = (pageNum - 1) * limitNum

    // Build filter conditions
    const where: any = {
      purchasedById: userId
    }

    const now = new Date()

    switch (status) {
      case 'active':
        where.active = true
        where.startDate = { lte: now }
        where.endDate = { gte: now }
        break
      case 'upcoming':
        where.startDate = { gt: now }
        break
      case 'expired':
        where.endDate = { lt: now }
        break
      case 'pending':
        where.approved = false
        break
    }

    const [spotlights, totalCount] = await Promise.all([
      prisma.spotlight.findMany({
        where,
        include: {
          profile: {
            include: {
              school: {
                select: {
                  name: true,
                  city: true,
                  state: true
                }
              },
              team: {
                select: {
                  name: true,
                  sport: true
                }
              }
            }
          }
        },
        orderBy: { startDate: 'desc' },
        skip: offset,
        take: limitNum
      }),
      prisma.spotlight.count({ where })
    ])

    // Transform response
    const transformedSpotlights = spotlights.map(spotlight => {
      const daysRemaining = Math.max(0, Math.ceil((spotlight.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      const canCancel = spotlight.startDate > now && spotlight.approved

      return {
        id: spotlight.id,
        title: spotlight.title,
        description: spotlight.description,
        image: spotlight.image,
        startDate: spotlight.startDate,
        endDate: spotlight.endDate,
        active: spotlight.active,
        approved: spotlight.approved,
        tokenCost: spotlight.tokenCost,
        player: {
          id: spotlight.profile.id,
          firstName: spotlight.profile.firstName,
          lastName: spotlight.profile.lastName,
          position: spotlight.profile.position,
          graduationYear: spotlight.profile.graduationYear,
          school: spotlight.profile.school,
          team: spotlight.profile.team,
          avatar: spotlight.profile.avatar
        },
        status: getSpotlightStatus(spotlight, now),
        daysRemaining,
        canCancel,
        refundAmount: canCancel ? Math.floor(spotlight.tokenCost * 0.8) : 0 // 80% refund for cancellations
      }
    })

    res.status(200).json({
      spotlights: transformedSpotlights,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      summary: await getSpotlightSummary(userId)
    })

  } catch (error) {
    console.error('User spotlights fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch user spotlights' })
  }
}

async function cancelSpotlight(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { spotlightId } = req.body

    if (!spotlightId) {
      return res.status(400).json({ error: 'Spotlight ID is required' })
    }

    // Get spotlight
    const spotlight = await prisma.spotlight.findUnique({
      where: { id: spotlightId },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!spotlight) {
      return res.status(404).json({ error: 'Spotlight not found' })
    }

    if (spotlight.purchasedById !== userId) {
      return res.status(403).json({ error: 'Permission denied' })
    }

    const now = new Date()

    // Check if cancellation is allowed
    if (spotlight.startDate <= now) {
      return res.status(400).json({ 
        error: 'Cannot cancel spotlight that has already started' 
      })
    }

    if (!spotlight.approved) {
      return res.status(400).json({ 
        error: 'Cannot cancel pending spotlight' 
      })
    }

    // Calculate refund (80% of original cost)
    const refundAmount = Math.floor(spotlight.tokenCost * 0.8)

    // Process cancellation and refund in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete the spotlight
      await tx.spotlight.delete({
        where: { id: spotlightId }
      })

      // Award refund tokens
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true }
      })

      const newBalance = (user?.tokenBalance || 0) + refundAmount

      await tx.user.update({
        where: { id: userId },
        data: { tokenBalance: newBalance }
      })

      // Create transaction record
      await tx.tokenTransaction.create({
        data: {
          userId,
          type: 'REFUNDED',
          amount: refundAmount,
          balance: newBalance,
          source: 'SPOTLIGHT_CANCELLATION',
          sourceId: spotlightId,
          description: `Spotlight cancellation refund (80% of ${spotlight.tokenCost} tokens)`
        }
      })

      return { newBalance }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SPOTLIGHT_CANCELLED',
        resource: 'spotlights',
        resourceId: spotlightId,
        newData: JSON.stringify({
          refundAmount,
          newBalance: result.newBalance,
          originalTokenCost: spotlight.tokenCost
        })
      }
    })

    res.status(200).json({
      success: true,
      message: `Spotlight cancelled. ${refundAmount} tokens refunded.`,
      refundAmount,
      newBalance: result.newBalance
    })

  } catch (error) {
    console.error('Spotlight cancellation error:', error)
    res.status(500).json({ error: 'Failed to cancel spotlight' })
  }
}

function getSpotlightStatus(spotlight: any, now: Date): string {
  if (!spotlight.approved) return 'pending'
  if (spotlight.endDate < now) return 'expired'
  if (spotlight.startDate > now) return 'upcoming'
  if (spotlight.active && spotlight.startDate <= now && spotlight.endDate >= now) return 'active'
  return 'inactive'
}

async function getSpotlightSummary(userId: string) {
  const now = new Date()

  const [
    totalSpotlights,
    activeSpotlights,
    upcomingSpotlights,
    totalSpent
  ] = await Promise.all([
    prisma.spotlight.count({
      where: { purchasedById: userId }
    }),
    prisma.spotlight.count({
      where: {
        purchasedById: userId,
        active: true,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    }),
    prisma.spotlight.count({
      where: {
        purchasedById: userId,
        startDate: { gt: now },
        approved: true
      }
    }),
    prisma.spotlight.aggregate({
      where: { purchasedById: userId },
      _sum: { tokenCost: true }
    })
  ])

  return {
    total: totalSpotlights,
    active: activeSpotlights,
    upcoming: upcomingSpotlights,
    totalTokensSpent: totalSpent._sum.tokenCost || 0
  }
}