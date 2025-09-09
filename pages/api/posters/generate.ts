import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, deductTokens, checkTokenBalance } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

interface PosterRequest {
  profileId: string
  templateId: string
  customizations?: {
    backgroundColor?: string
    textColor?: string
    accentColor?: string
    customText?: string
    statToHighlight?: string
  }
}

// Base token costs - will be modified by subscription tier
const BASE_POSTER_COSTS = {
  BASIC: 10,
  PREMIUM: 20,
  ELITE: 35
}

// Subscription tier discounts
const TIER_DISCOUNTS = {
  FREE: 0,
  STARTER: 0.10,    // 10% discount
  PRO: 0.20,        // 20% discount  
  ELITE: 0.35       // 35% discount
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
      templateId,
      customizations = {}
    }: PosterRequest = req.body

    // Validation
    if (!profileId || !templateId) {
      return res.status(400).json({ 
        error: 'Profile ID and template ID are required' 
      })
    }

    // Verify profile exists and user has permission
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: true,
        school: true,
        team: true,
        stats: {
          where: { verified: true },
          orderBy: { gameDate: 'desc' },
          take: 10
        }
      }
    })

    if (!profile) {
      return res.status(404).json({ error: 'Player profile not found' })
    }

    // Check permissions - can generate poster for own profile, or if parent/coach
    const canGenerate = profile.userId === session.user.id || 
                       ['PARENT', 'COACH', 'ADMIN'].includes(session.user.role)

    if (!canGenerate) {
      return res.status(403).json({ 
        error: 'Permission denied. You can only generate posters for your own profiles or if you are a parent/coach.' 
      })
    }

    // Get template details
    const template = await prisma.posterTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return res.status(404).json({ error: 'Poster template not found' })
    }

    if (!template.active) {
      return res.status(400).json({ error: 'This template is no longer available' })
    }

    // Check if user's subscription tier allows this template
    const requiredTier = template.tier
    const userTier = session.user.subscriptionTier

    if (!canAccessTemplate(userTier, requiredTier)) {
      return res.status(403).json({ 
        error: `This template requires ${requiredTier} subscription or higher`,
        userTier,
        requiredTier
      })
    }

    // Calculate token cost with subscription discount
    const baseCost = BASE_POSTER_COSTS[template.tier as keyof typeof BASE_POSTER_COSTS] || BASE_POSTER_COSTS.BASIC
    const discount = TIER_DISCOUNTS[session.user.subscriptionTier as keyof typeof TIER_DISCOUNTS] || 0
    const finalCost = Math.max(1, Math.floor(baseCost * (1 - discount))) // Minimum 1 token

    // Check token balance
    const balanceCheck = await checkTokenBalance(session.user.id, finalCost)
    if (!balanceCheck.canAfford) {
      return res.status(402).json({ 
        error: 'Insufficient token balance for poster generation',
        required: finalCost,
        current: balanceCheck.currentBalance,
        shortfall: finalCost - balanceCheck.currentBalance,
        pricing: {
          baseCost,
          discount: Math.round(discount * 100),
          finalCost
        }
      })
    }

    // Check for existing pending poster to prevent spam
    const existingPending = await prisma.poster.findFirst({
      where: {
        userId: session.user.id,
        profileId,
        status: { in: ['PENDING', 'GENERATING'] }
      }
    })

    if (existingPending) {
      return res.status(409).json({ 
        error: 'You already have a poster being generated for this player',
        existingPosterId: existingPending.id,
        status: existingPending.status
      })
    }

    // Create poster generation request
    const poster = await prisma.poster.create({
      data: {
        userId: session.user.id,
        profileId,
        templateId,
        customData: JSON.stringify(customizations),
        tokenCost: finalCost,
        status: 'PENDING'
      }
    })

    // Deduct tokens
    const deductResult = await deductTokens(
      session.user.id,
      finalCost,
      'AI_POSTER',
      poster.id,
      `AI poster generation for ${profile.firstName} ${profile.lastName} (${template.name})`
    )

    if (!deductResult.success) {
      // Rollback poster creation
      await prisma.poster.delete({ where: { id: poster.id } })
      return res.status(500).json({ error: deductResult.error })
    }

    // Update poster status to generating
    await prisma.poster.update({
      where: { id: poster.id },
      data: { status: 'GENERATING' }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'POSTER_GENERATION_STARTED',
        resource: 'posters',
        resourceId: poster.id,
        newData: JSON.stringify({
          profileId,
          templateId,
          templateName: template.name,
          templateTier: template.tier,
          baseCost,
          discount,
          finalCost,
          newBalance: deductResult.newBalance,
          customizations
        })
      }
    })

    // Simulate poster generation (in real implementation, this would trigger AI service)
    setTimeout(async () => {
      try {
        const generatedUrl = await generatePosterImage(profile, template, customizations)
        
        await prisma.poster.update({
          where: { id: poster.id },
          data: {
            status: 'COMPLETED',
            generatedUrl
          }
        })
      } catch (error) {
        console.error('Poster generation failed:', error)
        await prisma.poster.update({
          where: { id: poster.id },
          data: {
            status: 'FAILED',
            errorMessage: 'Failed to generate poster'
          }
        })
      }
    }, 5000) // 5 second simulation

    res.status(201).json({
      success: true,
      message: `Poster generation started for ${profile.firstName} ${profile.lastName}`,
      poster: {
        id: poster.id,
        status: poster.status,
        templateName: template.name,
        templateTier: template.tier,
        estimatedCompletionTime: '30-60 seconds'
      },
      pricing: {
        baseCost,
        discount: Math.round(discount * 100),
        finalCost,
        subscriptionTier: session.user.subscriptionTier
      },
      tokensSpent: finalCost,
      newBalance: deductResult.newBalance
    })

  } catch (error) {
    console.error('Poster generation error:', error)
    res.status(500).json({ error: 'Failed to start poster generation' })
  }
}

function canAccessTemplate(userTier: string, requiredTier: string): boolean {
  const tierLevels = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    ELITE: 3
  }

  const userLevel = tierLevels[userTier as keyof typeof tierLevels] || 0
  const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0

  return userLevel >= requiredLevel
}

// Simulate AI poster generation (replace with actual AI service)
async function generatePosterImage(
  profile: any, 
  template: any, 
  customizations: any
): Promise<string> {
  // In real implementation, this would:
  // 1. Send data to AI image generation service
  // 2. Apply template design with player stats
  // 3. Apply customizations (colors, text, etc.)
  // 4. Return generated image URL

  // For now, return a placeholder URL
  const mockImageUrl = `https://api.placeholder.com/800x1200/b3a369/ffffff?text=${encodeURIComponent(
    `${profile.firstName} ${profile.lastName}\n${profile.position || 'Player'}\n${profile.school?.name || 'High School'}`
  )}`

  return mockImageUrl
}