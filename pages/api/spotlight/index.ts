import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthSession } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      status = 'active',
      page = 1,
      limit = 10,
      sport,
      state = 'Alabama'
    } = req.query

    const session = await getAuthSession(req, res)
    const pageNum = parseInt(page as string)
    const limitNum = Math.min(parseInt(limit as string), 50) // Max 50 per request
    const offset = (pageNum - 1) * limitNum

    // Build filter conditions
    const where: any = {
      approved: true
    }

    const now = new Date()

    // Filter by status
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
      case 'all':
        // No additional filters
        break
    }

    // Include profile filters
    const profileWhere: any = {}
    if (sport) {
      profileWhere.team = {
        sport: sport.toString().toUpperCase()
      }
    }

    // Get spotlights with pagination
    const [spotlights, totalCount] = await Promise.all([
      prisma.spotlight.findMany({
        where,
        include: {
          profile: {
            where: profileWhere,
            include: {
              user: {
                select: {
                  state: true
                }
              },
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
          purchasedBy: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: [
          { active: 'desc' },
          { startDate: 'desc' }
        ],
        skip: offset,
        take: limitNum
      }),
      prisma.spotlight.count({ where })
    ])

    // Filter by state if specified
    const filteredSpotlights = state !== 'all' 
      ? spotlights.filter(s => s.profile?.user?.state === state || s.profile?.school?.state === state)
      : spotlights

    // Transform response data
    const transformedSpotlights = filteredSpotlights.map(spotlight => ({
      id: spotlight.id,
      title: spotlight.title,
      description: spotlight.description,
      image: spotlight.image,
      startDate: spotlight.startDate,
      endDate: spotlight.endDate,
      active: spotlight.active,
      tokenCost: spotlight.tokenCost,
      player: spotlight.profile ? {
        id: spotlight.profile.id,
        firstName: spotlight.profile.firstName,
        lastName: spotlight.profile.lastName,
        position: spotlight.profile.position,
        graduationYear: spotlight.profile.graduationYear,
        school: spotlight.profile.school,
        team: spotlight.profile.team,
        avatar: spotlight.profile.avatar
      } : null,
      purchasedBy: session?.user?.role === 'ADMIN' ? spotlight.purchasedBy : null,
      daysRemaining: Math.max(0, Math.ceil((spotlight.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))),
      isExpired: spotlight.endDate < now
    }))

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
      filters: {
        status,
        sport,
        state
      }
    })

  } catch (error) {
    console.error('Spotlight listing error:', error)
    res.status(500).json({ error: 'Failed to fetch spotlights' })
  }
}