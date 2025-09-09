import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, deductTokens, checkTokenBalance } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

interface NominateRequest {
  awardId: string
  profileId: string
  reason?: string
}

const NOMINATION_TOKEN_COST = 5 // Cost to nominate a player

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { awardId, profileId, reason }: NominateRequest = req.body

    // Validation
    if (!awardId || !profileId) {
      return res.status(400).json({ 
        error: 'Award ID and Profile ID are required' 
      })
    }

    // Verify award exists and is active
    const award = await prisma.award.findUnique({
      where: { id: awardId }
    })

    if (!award) {
      return res.status(404).json({ error: 'Award not found' })
    }

    if (award.status !== 'ACTIVE') {
      return res.status(400).json({ 
        error: 'Award is not accepting nominations',
        status: award.status
      })
    }

    if (award.votingEnds && award.votingEnds < new Date()) {
      return res.status(400).json({ 
        error: 'Voting period has ended for this award' 
      })
    }

    // Verify profile exists and is eligible
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: true,
        school: true,
        team: true
      }
    })

    if (!profile) {
      return res.status(404).json({ error: 'Player profile not found' })
    }

    if (!profile.public) {
      return res.status(400).json({ 
        error: 'Cannot nominate private profiles' 
      })
    }

    // Check if profile matches award criteria
    if (profile.team?.sport && award.sport !== 'ALL' && profile.team.sport !== award.sport) {
      return res.status(400).json({ 
        error: `Player must be in ${award.sport} to be nominated for this award` 
      })
    }

    // Check state eligibility
    if (award.state !== 'ALL' && profile.user.state !== award.state && profile.school?.state !== award.state) {
      return res.status(400).json({ 
        error: `Player must be from ${award.state} to be nominated for this award` 
      })
    }

    // Check if already nominated
    const existingNomination = await prisma.nomination.findUnique({
      where: {
        awardId_profileId: {
          awardId,
          profileId
        }
      }
    })

    if (existingNomination) {
      return res.status(409).json({ 
        error: 'Player is already nominated for this award',
        nominationId: existingNomination.id
      })
    }

    // Check token balance for nomination fee
    const balanceCheck = await checkTokenBalance(session.user.id, NOMINATION_TOKEN_COST)
    if (!balanceCheck.canAfford) {
      return res.status(402).json({ 
        error: 'Insufficient token balance for nomination',
        required: NOMINATION_TOKEN_COST,
        current: balanceCheck.currentBalance,
        shortfall: NOMINATION_TOKEN_COST - balanceCheck.currentBalance
      })
    }

    // Create the nomination
    const nomination = await prisma.nomination.create({
      data: {
        awardId,
        profileId,
        reason: reason?.trim(),
        tokenCost: NOMINATION_TOKEN_COST
      }
    })

    // Deduct nomination fee
    const deductResult = await deductTokens(
      session.user.id,
      NOMINATION_TOKEN_COST,
      'NOMINATION',
      nomination.id,
      `Nominated ${profile.firstName} ${profile.lastName} for ${award.title}`
    )

    if (!deductResult.success) {
      // Rollback nomination
      await prisma.nomination.delete({ where: { id: nomination.id } })
      return res.status(500).json({ error: deductResult.error })
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PLAYER_NOMINATED',
        resource: 'nominations',
        resourceId: nomination.id,
        newData: JSON.stringify({
          awardId,
          profileId,
          playerName: `${profile.firstName} ${profile.lastName}`,
          awardTitle: award.title,
          tokenCost: NOMINATION_TOKEN_COST,
          newBalance: deductResult.newBalance
        })
      }
    })

    res.status(201).json({
      success: true,
      message: `Successfully nominated ${profile.firstName} ${profile.lastName} for ${award.title}`,
      nomination: {
        id: nomination.id,
        awardId: nomination.awardId,
        profileId: nomination.profileId,
        reason: nomination.reason,
        tokenCost: nomination.tokenCost,
        voteCount: nomination.voteCount,
        createdAt: nomination.createdAt
      },
      player: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        position: profile.position,
        graduationYear: profile.graduationYear,
        school: profile.school?.name,
        team: profile.team?.name
      },
      tokensSpent: NOMINATION_TOKEN_COST,
      newBalance: deductResult.newBalance
    })

  } catch (error) {
    console.error('Nomination error:', error)
    res.status(500).json({ error: 'Failed to create nomination' })
  }
}