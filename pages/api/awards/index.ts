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
      sport,
      state = 'Alabama',
      type,
      page = 1,
      limit = 20,
      featured
    } = req.query

    const session = await getAuthSession(req, res)
    const pageNum = parseInt(page as string)
    const limitNum = Math.min(parseInt(limit as string), 50)
    const offset = (pageNum - 1) * limitNum

    // Build filter conditions
    const where: any = {}

    // Filter by status
    switch (status) {
      case 'active':
        where.status = 'ACTIVE'
        where.votingEnds = { gte: new Date() }
        break
      case 'closed':
        where.status = 'CLOSED'
        break
      case 'archived':
        where.status = 'ARCHIVED'
        break
      case 'all':
        // No status filter
        break
    }

    // Other filters
    if (sport && sport !== 'all') {
      where.sport = sport.toString().toUpperCase()
    }

    if (state && state !== 'all') {
      where.state = state
    }

    if (type) {
      where.type = type
    }

    if (featured === 'true') {
      where.featured = true
    }

    // Get awards with nominations and vote counts
    const [awards, totalCount] = await Promise.all([
      prisma.award.findMany({
        where,
        include: {
          nominations: {
            include: {
              profile: {
                include: {
                  school: {
                    select: { name: true, city: true, state: true }
                  },
                  team: {
                    select: { name: true, sport: true }
                  }
                }
              }
            },
            orderBy: { voteCount: 'desc' }
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              nominations: true,
              votes: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limitNum
      }),
      prisma.award.count({ where })
    ])

    // Transform response data
    const transformedAwards = await Promise.all(
      awards.map(async (award) => {
        // Get user's vote for this award if authenticated
        let userVote = null
        if (session?.user) {
          userVote = await prisma.vote.findUnique({
            where: {
              awardId_userId: {
                awardId: award.id,
                userId: session.user.id
              }
            },
            include: {
              nomination: {
                include: {
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          })
        }

        // Calculate time remaining
        const now = new Date()
        const timeRemaining = award.votingEnds ? Math.max(0, award.votingEnds.getTime() - now.getTime()) : 0
        const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
        const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

        // Get total votes for this award
        const totalVotes = award.nominations.reduce((sum, nomination) => sum + nomination.voteCount, 0)

        // Transform nominations for response
        const topNominations = award.nominations.slice(0, 10).map(nomination => ({
          id: nomination.id,
          voteCount: nomination.voteCount,
          reason: nomination.reason,
          player: {
            id: nomination.profile.id,
            firstName: nomination.profile.firstName,
            lastName: nomination.profile.lastName,
            position: nomination.profile.position,
            graduationYear: nomination.profile.graduationYear,
            school: nomination.profile.school?.name,
            team: nomination.profile.team?.name,
            avatar: nomination.profile.avatar
          },
          percentage: totalVotes > 0 ? Math.round((nomination.voteCount / totalVotes) * 100) : 0
        }))

        return {
          id: award.id,
          title: award.title,
          description: award.description,
          type: award.type,
          sport: award.sport,
          state: award.state,
          week: award.week,
          season: award.season,
          status: award.status,
          featured: award.featured,
          votingEnds: award.votingEnds,
          tokenCostPerVote: award.tokenCostPerVote,
          maxVotesPerUser: award.maxVotesPerUser,
          createdAt: award.createdAt,
          createdBy: session?.user?.role === 'ADMIN' ? award.createdBy : null,
          stats: {
            totalNominations: award._count.nominations,
            totalVotes,
            totalVoters: award._count.votes
          },
          timeRemaining: {
            days: daysRemaining,
            hours: hoursRemaining,
            expired: timeRemaining <= 0
          },
          topNominations,
          userVote: userVote ? {
            voteCount: userVote.voteCount,
            tokenCost: userVote.tokenCost,
            votedFor: {
              id: userVote.nomination.profile.id,
              name: `${userVote.nomination.profile.firstName} ${userVote.nomination.profile.lastName}`
            }
          } : null,
          canVote: session?.user && award.status === 'ACTIVE' && timeRemaining > 0,
          canNominate: session?.user && award.status === 'ACTIVE' && timeRemaining > 0
        }
      })
    )

    res.status(200).json({
      awards: transformedAwards,
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
        state,
        type,
        featured
      }
    })

  } catch (error) {
    console.error('Awards listing error:', error)
    res.status(500).json({ error: 'Failed to fetch awards' })
  }
}