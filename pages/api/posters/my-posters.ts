import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res)
  if (!session) return

  switch (req.method) {
    case 'GET':
      return await getUserPosters(req, res, session.user.id)
    case 'DELETE':
      return await deletePoster(req, res, session.user.id)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getUserPosters(req: NextApiRequest, res: NextApiResponse, userId: string) {
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
      userId
    }

    if (status && status !== 'all') {
      where.status = status.toString().toUpperCase()
    }

    const [posters, totalCount] = await Promise.all([
      prisma.poster.findMany({
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
          },
          template: {
            select: {
              name: true,
              tier: true,
              sport: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum
      }),
      prisma.poster.count({ where })
    ])

    // Transform response
    const transformedPosters = posters.map(poster => ({
      id: poster.id,
      status: poster.status,
      generatedUrl: poster.generatedUrl,
      tokenCost: poster.tokenCost,
      errorMessage: poster.errorMessage,
      createdAt: poster.createdAt,
      updatedAt: poster.updatedAt,
      player: {
        id: poster.profile.id,
        firstName: poster.profile.firstName,
        lastName: poster.profile.lastName,
        position: poster.profile.position,
        graduationYear: poster.profile.graduationYear,
        school: poster.profile.school,
        team: poster.profile.team,
        avatar: poster.profile.avatar
      },
      template: {
        name: poster.template.name,
        tier: poster.template.tier,
        sport: poster.template.sport
      },
      customizations: poster.customData ? JSON.parse(poster.customData) : null,
      downloadable: poster.status === 'COMPLETED' && poster.generatedUrl,
      canDelete: ['PENDING', 'FAILED'].includes(poster.status)
    }))

    res.status(200).json({
      posters: transformedPosters,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      summary: await getPosterSummary(userId)
    })

  } catch (error) {
    console.error('User posters fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch user posters' })
  }
}

async function deletePoster(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { posterId } = req.body

    if (!posterId) {
      return res.status(400).json({ error: 'Poster ID is required' })
    }

    // Get poster
    const poster = await prisma.poster.findUnique({
      where: { id: posterId },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!poster) {
      return res.status(404).json({ error: 'Poster not found' })
    }

    if (poster.userId !== userId) {
      return res.status(403).json({ error: 'Permission denied' })
    }

    // Only allow deletion of pending or failed posters
    if (!['PENDING', 'FAILED'].includes(poster.status)) {
      return res.status(400).json({ 
        error: 'Can only delete pending or failed posters',
        status: poster.status
      })
    }

    // Delete the poster
    await prisma.poster.delete({
      where: { id: posterId }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'POSTER_DELETED',
        resource: 'posters',
        resourceId: posterId,
        newData: JSON.stringify({
          playerName: `${poster.profile.firstName} ${poster.profile.lastName}`,
          status: poster.status,
          tokenCost: poster.tokenCost
        })
      }
    })

    res.status(200).json({
      success: true,
      message: `Poster deleted successfully`
    })

  } catch (error) {
    console.error('Poster deletion error:', error)
    res.status(500).json({ error: 'Failed to delete poster' })
  }
}

async function getPosterSummary(userId: string) {
  const [
    totalPosters,
    completedPosters,
    pendingPosters,
    failedPosters,
    totalSpent
  ] = await Promise.all([
    prisma.poster.count({
      where: { userId }
    }),
    prisma.poster.count({
      where: { userId, status: 'COMPLETED' }
    }),
    prisma.poster.count({
      where: { userId, status: { in: ['PENDING', 'GENERATING'] } }
    }),
    prisma.poster.count({
      where: { userId, status: 'FAILED' }
    }),
    prisma.poster.aggregate({
      where: { userId },
      _sum: { tokenCost: true }
    })
  ])

  return {
    total: totalPosters,
    completed: completedPosters,
    pending: pendingPosters,
    failed: failedPosters,
    totalTokensSpent: totalSpent._sum.tokenCost || 0
  }
}