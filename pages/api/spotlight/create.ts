import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, deductTokens, checkTokenBalance } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

interface SpotlightRequest {
  profileId: string
  title: string
  description?: string
  image?: string
  duration: 'WEEK' | 'MONTH'
  startDate: string
}

const SPOTLIGHT_COSTS = {
  WEEK: 25,
  MONTH: 75
}

const SPOTLIGHT_DURATION_DAYS = {
  WEEK: 7,
  MONTH: 30
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const {
      profileId,
      title,
      description,
      image,
      duration,
      startDate
    }: SpotlightRequest = req.body

    // Validation
    if (!profileId || !title || !duration || !startDate) {
      return res.status(400).json({ 
        error: 'Profile ID, title, duration, and start date are required' 
      })
    }

    if (!SPOTLIGHT_COSTS[duration]) {
      return res.status(400).json({ 
        error: 'Invalid duration. Must be WEEK or MONTH' 
      })
    }

    // Verify profile exists and user has permission
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    })

    if (!profile) {
      return res.status(404).json({ error: 'Player profile not found' })
    }

    // Check permissions - can spotlight own profile, or if parent/coach
    const canSpotlight = profile.userId === session.user.id || 
                        ['PARENT', 'COACH', 'ADMIN'].includes(session.user.role)

    if (!canSpotlight) {
      return res.status(403).json({ 
        error: 'Permission denied. You can only spotlight your own profiles or if you are a parent/coach.' 
      })
    }

    const tokenCost = SPOTLIGHT_COSTS[duration]
    const durationDays = SPOTLIGHT_DURATION_DAYS[duration]

    // Check token balance
    const balanceCheck = await checkTokenBalance(session.user.id, tokenCost)
    if (!balanceCheck.canAfford) {
      return res.status(402).json({ 
        error: 'Insufficient token balance',
        required: tokenCost,
        current: balanceCheck.currentBalance,
        shortfall: tokenCost - balanceCheck.currentBalance
      })
    }

    // Parse dates
    const start = new Date(startDate)
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000)

    // Check for conflicting spotlights in the date range
    const conflictingSpotlight = await prisma.spotlight.findFirst({
      where: {
        profileId,
        approved: true,
        OR: [
          {
            startDate: { lte: start },
            endDate: { gte: start }
          },
          {
            startDate: { lte: end },
            endDate: { gte: end }
          },
          {
            startDate: { gte: start },
            endDate: { lte: end }
          }
        ]
      }
    })

    if (conflictingSpotlight) {
      return res.status(409).json({ 
        error: 'This player already has a spotlight during the selected period',
        conflictingSpotlight: {
          id: conflictingSpotlight.id,
          startDate: conflictingSpotlight.startDate,
          endDate: conflictingSpotlight.endDate
        }
      })
    }

    // Create the spotlight
    const spotlight = await prisma.spotlight.create({
      data: {
        purchasedById: session.user.id,
        profileId,
        title: title.trim(),
        description: description?.trim(),
        image,
        startDate: start,
        endDate: end,
        tokenCost,
        approved: true, // Auto-approve token purchases
        active: start <= new Date() // Activate if start date is now or in past
      }
    })

    // Deduct tokens
    const deductResult = await deductTokens(
      session.user.id,
      tokenCost,
      'SPOTLIGHT',
      spotlight.id,
      `${duration.toLowerCase()} spotlight for ${profile.firstName} ${profile.lastName}`
    )

    if (!deductResult.success) {
      // Rollback spotlight creation
      await prisma.spotlight.delete({ where: { id: spotlight.id } })
      return res.status(500).json({ error: deductResult.error })
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SPOTLIGHT_CREATED',
        resource: 'spotlights',
        resourceId: spotlight.id,
        newData: JSON.stringify({
          profileId,
          duration,
          tokenCost,
          startDate: start,
          endDate: end,
          newBalance: deductResult.newBalance
        })
      }
    })

    res.status(201).json({
      success: true,
      message: `Spotlight created successfully for ${duration.toLowerCase()}`,
      spotlight: {
        id: spotlight.id,
        title: spotlight.title,
        description: spotlight.description,
        startDate: spotlight.startDate,
        endDate: spotlight.endDate,
        duration,
        tokenCost,
        active: spotlight.active
      },
      tokensSpent: tokenCost,
      newBalance: deductResult.newBalance
    })

  } catch (error) {
    console.error('Spotlight creation error:', error)
    res.status(500).json({ error: 'Failed to create spotlight' })
  }
}