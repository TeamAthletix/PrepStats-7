import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

interface CreateAwardRequest {
  title: string
  description?: string
  type: 'PLAYER_OF_WEEK' | 'CUSTOM'
  sport: string
  state?: string
  week?: number
  season: string
  featured?: boolean
  votingEnds?: string
  tokenCostPerVote?: number
  maxVotesPerUser?: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['COACH', 'MEDIA', 'ADMIN'])
  if (!session) return

  try {
    const {
      title,
      description,
      type,
      sport,
      state = 'Alabama',
      week,
      season,
      featured = false,
      votingEnds,
      tokenCostPerVote = 1,
      maxVotesPerUser = 10
    }: CreateAwardRequest = req.body

    // Validation
    if (!title || !sport || !season) {
      return res.status(400).json({ 
        error: 'Title, sport, and season are required' 
      })
    }

    if (type === 'PLAYER_OF_WEEK' && !week) {
      return res.status(400).json({ 
        error: 'Week number is required for Player of the Week awards' 
      })
    }

    // Check for duplicate Player of the Week awards
    if (type === 'PLAYER_OF_WEEK') {
      const existingAward = await prisma.award.findFirst({
        where: {
          type: 'PLAYER_OF_WEEK',
          sport: sport.toUpperCase(),
          state,
          week,
          season,
          status: { in: ['ACTIVE', 'CLOSED'] }
        }
      })

      if (existingAward) {
        return res.status(409).json({ 
          error: `Player of the Week award already exists for ${sport} Week ${week} ${season}`,
          existingAward: {
            id: existingAward.id,
            title: existingAward.title
          }
        })
      }
    }

    // Set voting end date
    let votingEndDate: Date
    if (votingEnds) {
      votingEndDate = new Date(votingEnds)
    } else {
      // Default: 7 days from now for custom awards, end of week for Player of Week
      if (type === 'PLAYER_OF_WEEK') {
        const now = new Date()
        const daysUntilSunday = 7 - now.getDay()
        votingEndDate = new Date(now.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000)
        votingEndDate.setHours(23, 59, 59, 999) // End of Sunday
      } else {
        votingEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }

    // Only ADMIN can create featured awards without token cost
    if (featured && session.user.role !== 'ADMIN') {
      // TODO: Implement token cost for featuring awards
      // For now, only admins can create featured awards
      return res.status(403).json({ 
        error: 'Only administrators can create featured awards' 
      })
    }

    // Create the award
    const award = await prisma.award.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        type,
        sport: sport.toUpperCase(),
        state,
        week,
        season,
        createdById: session.user.id,
        featured,
        votingEnds: votingEndDate,
        tokenCostPerVote,
        maxVotesPerUser,
        status: 'ACTIVE'
      }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AWARD_CREATED',
        resource: 'awards',
        resourceId: award.id,
        newData: JSON.stringify({
          title,
          type,
          sport,
          week,
          season,
          featured,
          votingEnds: votingEndDate
        })
      }
    })

    res.status(201).json({
      success: true,
      message: 'Award created successfully',
      award: {
        id: award.id,
        title: award.title,
        description: award.description,
        type: award.type,
        sport: award.sport,
        state: award.state,
        week: award.week,
        season: award.season,
        featured: award.featured,
        votingEnds: award.votingEnds,
        tokenCostPerVote: award.tokenCostPerVote,
        maxVotesPerUser: award.maxVotesPerUser,
        status: award.status,
        createdAt: award.createdAt
      }
    })

  } catch (error) {
    console.error('Award creation error:', error)
    res.status(500).json({ error: 'Failed to create award' })
  }
}