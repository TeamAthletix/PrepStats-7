import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, deductTokens, checkTokenBalance } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

// Token costs for different actions
const TOKEN_COSTS = {
  SPOTLIGHT_WEEK: 25,        // Weekly spotlight feature
  SPOTLIGHT_MONTH: 75,       // Monthly spotlight feature  
  VOTE_SINGLE: 1,            // Single vote in poll
  VOTE_PACK_5: 4,            // 5 votes (20% discount)
  VOTE_PACK_10: 7,           // 10 votes (30% discount)
  AI_POSTER_BASIC: 5,        // Basic AI poster generation
  AI_POSTER_PREMIUM: 10,     // Premium AI poster with custom template
  LEADERBOARD_BOOST: 15,     // Boost player ranking for 24 hours
  FEATURED_AWARD: 50,        // Feature custom award prominently
  AD_FREE_WEEK: 10,          // Ad-free experience for 1 week
  AD_FREE_MONTH: 30          // Ad-free experience for 1 month
}

interface SpendRequest {
  action: keyof typeof TOKEN_COSTS
  targetId?: string          // ID of player, award, etc.
  quantity?: number          // For vote packs, multiple purchases
  metadata?: any             // Additional context data
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { action, targetId, quantity = 1, metadata }: SpendRequest = req.body

    if (!action || !TOKEN_COSTS[action]) {
      return res.status(400).json({ error: 'Invalid action specified' })
    }

    const tokenCost = TOKEN_COSTS[action] * quantity

    // Check if user has sufficient tokens
    const balanceCheck = await checkTokenBalance(session.user.id, tokenCost)
    if (!balanceCheck.canAfford) {
      return res.status(402).json({ 
        error: 'Insufficient token balance',
        required: tokenCost,
        current: balanceCheck.currentBalance,
        shortfall: tokenCost - balanceCheck.currentBalance
      })
    }

    // Validate action-specific requirements
    const validationResult = await validateSpendingAction(action, targetId, session.user.id, metadata)
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.error })
    }

    // Process the spending based on action type
    const processResult = await processTokenSpending(
      action,
      session.user.id,
      targetId,
      quantity,
      tokenCost,
      metadata
    )

    if (!processResult.success) {
      return res.status(500).json({ error: processResult.error })
    }

    // Deduct tokens and create transaction
    const deductResult = await deductTokens(
      session.user.id,
      tokenCost,
      action,
      targetId,
      `${action.replace(/_/g, ' ').toLowerCase()} - ${tokenCost} tokens`
    )

    if (!deductResult.success) {
      return res.status(500).json({ error: deductResult.error })
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOKENS_SPENT',
        resource: 'token_transactions',
        resourceId: processResult.recordId,
        newData: JSON.stringify({
          action,
          tokenCost,
          quantity,
          targetId,
          newBalance: deductResult.newBalance,
          metadata
        })
      }
    })

    res.status(200).json({
      success: true,
      message: `Successfully spent ${tokenCost} tokens for ${action}`,
      tokensSpent: tokenCost,
      newBalance: deductResult.newBalance,
      actionResult: processResult.data
    })

  } catch (error) {
    console.error('Token spending error:', error)
    res.status(500).json({ error: 'Failed to process token spending' })
  }
}

async function validateSpendingAction(
  action: string,
  targetId: string | undefined,
  userId: string,
  metadata: any
): Promise<{ valid: boolean; error?: string }> {
  
  switch (action) {
    case 'SPOTLIGHT_WEEK':
    case 'SPOTLIGHT_MONTH':
      if (!targetId) {
        return { valid: false, error: 'Player profile ID required for spotlight' }
      }
      
      // Check if profile exists and user has permission
      const profile = await prisma.profile.findUnique({
        where: { id: targetId },
        include: { user: true }
      })
      
      if (!profile) {
        return { valid: false, error: 'Player profile not found' }
      }
      
      // Only allow spotlighting own profiles or if user is parent/coach
      if (profile.userId !== userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })
        
        if (!['PARENT', 'COACH', 'ADMIN'].includes(user?.role || '')) {
          return { valid: false, error: 'Permission denied for this profile' }
        }
      }
      break

    case 'VOTE_SINGLE':
    case 'VOTE_PACK_5':
    case 'VOTE_PACK_10':
      if (!targetId) {
        return { valid: false, error: 'Award nomination ID required for voting' }
      }
      
      // Check if nomination exists and voting is still open
      const nomination = await prisma.nomination.findUnique({
        where: { id: targetId },
        include: { award: true }
      })
      
      if (!nomination) {
        return { valid: false, error: 'Award nomination not found' }
      }
      
      if (nomination.award.status !== 'ACTIVE') {
        return { valid: false, error: 'Voting is closed for this award' }
      }
      break

    case 'AI_POSTER_BASIC':
    case 'AI_POSTER_PREMIUM':
      if (!targetId) {
        return { valid: false, error: 'Player profile ID required for poster generation' }
      }
      break

    case 'FEATURED_AWARD':
      if (!targetId) {
        return { valid: false, error: 'Award ID required for featuring' }
      }
      
      // Check if award exists and user created it
      const award = await prisma.award.findUnique({
        where: { id: targetId }
      })
      
      if (!award) {
        return { valid: false, error: 'Award not found' }
      }
      
      if (award.createdById !== userId) {
        return { valid: false, error: 'Can only feature awards you created' }
      }
      break
  }

  return { valid: true }
}

async function processTokenSpending(
  action: string,
  userId: string,
  targetId: string | undefined,
  quantity: number,
  tokenCost: number,
  metadata: any
): Promise<{ success: boolean; error?: string; recordId?: string; data?: any }> {
  
  try {
    switch (action) {
      case 'SPOTLIGHT_WEEK':
        return await createSpotlight(userId, targetId!, 7, tokenCost)
        
      case 'SPOTLIGHT_MONTH':
        return await createSpotlight(userId, targetId!, 30, tokenCost)
        
      case 'VOTE_SINGLE':
      case 'VOTE_PACK_5':
      case 'VOTE_PACK_10':
        const voteCount = action === 'VOTE_SINGLE' ? 1 : 
                         action === 'VOTE_PACK_5' ? 5 : 10
        return await castVotes(userId, targetId!, voteCount, tokenCost)
        
      case 'AI_POSTER_BASIC':
      case 'AI_POSTER_PREMIUM':
        const templateType = action === 'AI_POSTER_PREMIUM' ? 'PREMIUM' : 'BASIC'
        return await createPosterRequest(userId, targetId!, templateType, tokenCost)
        
      case 'LEADERBOARD_BOOST':
        return await applyLeaderboardBoost(targetId!, 24, tokenCost)
        
      case 'FEATURED_AWARD':
        return await featureAward(targetId!, tokenCost)
        
      case 'AD_FREE_WEEK':
      case 'AD_FREE_MONTH':
        const duration = action === 'AD_FREE_WEEK' ? 7 : 30
        return await grantAdFreeAccess(userId, duration, tokenCost)
        
      default:
        return { success: false, error: 'Unsupported action type' }
    }
  } catch (error) {
    console.error('Error processing token spending:', error)
    return { success: false, error: 'Failed to process spending action' }
  }
}

async function createSpotlight(
  userId: string,
  profileId: string,
  durationDays: number,
  tokenCost: number
): Promise<{ success: boolean; recordId?: string; data?: any }> {
  
  const spotlight = await prisma.spotlight.create({
    data: {
      purchasedById: userId,
      profileId,
      title: 'Player Spotlight',
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      tokenCost,
      approved: true, // Auto-approve token purchases
      active: true
    }
  })
  
  return { 
    success: true, 
    recordId: spotlight.id,
    data: { duration: durationDays, spotlightId: spotlight.id }
  }
}

async function castVotes(
  userId: string,
  nominationId: string,
  voteCount: number,
  tokenCost: number
): Promise<{ success: boolean; recordId?: string; data?: any }> {
  
  // Get nomination and award info
  const nomination = await prisma.nomination.findUnique({
    where: { id: nominationId },
    include: { award: true }
  })
  
  if (!nomination) {
    return { success: false, error: 'Nomination not found' }
  }
  
  // Update or create vote record
  const vote = await prisma.vote.upsert({
    where: {
      awardId_userId: {
        awardId: nomination.awardId,
        userId
      }
    },
    update: {
      voteCount: { increment: voteCount },
      tokenCost: { increment: tokenCost }
    },
    create: {
      awardId: nomination.awardId,
      nominationId,
      userId,
      profileId: nomination.profileId,
      voteCount,
      tokenCost
    }
  })
  
  // Update nomination vote count
  await prisma.nomination.update({
    where: { id: nominationId },
    data: { voteCount: { increment: voteCount } }
  })
  
  return { 
    success: true, 
    recordId: vote.id,
    data: { votesAdded: voteCount, totalVotes: vote.voteCount + voteCount }
  }
}

async function createPosterRequest(
  userId: string,
  profileId: string,
  templateType: string,
  tokenCost: number
): Promise<{ success: boolean; recordId?: string; data?: any }> {
  
  // Get available template for type
  const template = await prisma.posterTemplate.findFirst({
    where: { 
      tier: templateType,
      active: true 
    }
  })
  
  if (!template) {
    return { success: false, error: 'No available templates for this type' }
  }
  
  const poster = await prisma.poster.create({
    data: {
      userId,
      profileId,
      templateId: template.id,
      tokenCost,
      status: 'PENDING'
    }
  })
  
  return { 
    success: true, 
    recordId: poster.id,
    data: { posterId: poster.id, templateType }
  }
}

async function applyLeaderboardBoost(
  profileId: string,
  durationHours: number,
  tokenCost: number
): Promise<{ success: boolean; recordId?: string; data?: any }> {
  
  // Implementation would depend on your leaderboard system
  // For now, we'll create a system config entry
  const boostId = `boost_${profileId}_${Date.now()}`
  
  await prisma.systemConfig.create({
    data: {
      key: `leaderboard_boost_${boostId}`,
      value: JSON.stringify({
        profileId,
        boostMultiplier: 1.5,
        expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000),
        tokenCost
      })
    }
  })
  
  return { 
    success: true, 
    recordId: boostId,
    data: { duration: durationHours, multiplier: 1.5 }
  }
}

async function featureAward(
  awardId: string,
  tokenCost: number
): Promise<{ success: boolean; recordId?: string; data?: any }> {
  
  const award = await prisma.award.update({
    where: { id: awardId },
    data: { featured: true }
  })
  
  return { 
    success: true, 
    recordId: award.id,
    data: { featured: true }
  }
}

async function grantAdFreeAccess(
  userId: string,
  durationDays: number,
  tokenCost: number
): Promise<{ success: boolean; recordId?: string; data?: any }> {
  
  const configId = `adfree_${userId}_${Date.now()}`
  
  await prisma.systemConfig.create({
    data: {
      key: `ad_free_${configId}`,
      value: JSON.stringify({
        userId,
        expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        tokenCost
      })
    }
  })
  
  return { 
    success: true, 
    recordId: configId,
    data: { duration: durationDays }
  }
}