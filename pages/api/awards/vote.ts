import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, deductTokens, checkTokenBalance } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

interface VoteRequest {
  nominationId: string
  voteCount: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { nominationId, voteCount }: VoteRequest = req.body

    // Validation
    if (!nominationId || !voteCount || voteCount < 1) {
      return res.status(400).json({ 
        error: 'Nomination ID and valid vote count are required' 
      })
    }

    // Get nomination with award details
    const nomination = await prisma.nomination.findUnique({
      where: { id: nominationId },
      include: {
        award: true,
        profile: {
          include: {
            school: true,
            team: true
          }
        }
      }
    })

    if (!nomination) {
      return res.status(404).json({ error: 'Nomination not found' })
    }

    const award = nomination.award

    // Check if voting is still open
    if (award.status !== 'ACTIVE') {
      return res.status(400).json({ 
        error: 'Voting is closed for this award',
        status: award.status
      })
    }

    if (award.votingEnds && award.votingEnds < new Date()) {
      return res.status(400).json({ 
        error: 'Voting period has ended for this award' 
      })
    }

    // Check existing votes by this user for this award
    const existingVote = await prisma.vote.findUnique({
      where: {
        awardId_userId: {
          awardId: award.id,
          userId: session.user.id
        }
      }
    })

    const currentVoteCount = existingVote?.voteCount || 0
    const newTotalVotes = currentVoteCount + voteCount

    // Check vote limits
    if (newTotalVotes > award.maxVotesPerUser) {
      return res.status(400).json({ 
        error: `Maximum ${award.maxVotesPerUser} votes per user for this award`,
        current: currentVoteCount,
        requested: voteCount,
        maxAllowed: award.maxVotesPerUser
      })
    }

    // Calculate token cost
    const tokenCost = voteCount * award.tokenCostPerVote

    // Check token balance
    const balanceCheck = await checkTokenBalance(session.user.id, tokenCost)
    if (!balanceCheck.canAfford) {
      return res.status(402).json({ 
        error: 'Insufficient token balance for voting',
        required: tokenCost,
        current: balanceCheck.currentBalance,
        shortfall: tokenCost - balanceCheck.currentBalance
      })
    }

    // Process voting in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or create vote record
      const vote = await tx.vote.upsert({
        where: {
          awardId_userId: {
            awardId: award.id,
            userId: session.user.id
          }
        },
        update: {
          voteCount: newTotalVotes,
          tokenCost: (existingVote?.tokenCost || 0) + tokenCost,
          nominationId // Update nomination if user changes their vote target
        },
        create: {
          awardId: award.id,
          nominationId,
          userId: session.user.id,
          profileId: nomination.profileId,
          voteCount,
          tokenCost
        }
      })

      // Update nomination vote count
      const updatedNomination = await tx.nomination.update({
        where: { id: nominationId },
        data: { voteCount: { increment: voteCount } }
      })

      // If user switched nominations, decrement old nomination
      if (existingVote && existingVote.nominationId !== nominationId) {
        await tx.nomination.update({
          where: { id: existingVote.nominationId },
          data: { voteCount: { decrement: existingVote.voteCount } }
        })
      }

      return { vote, updatedNomination }
    })

    // Deduct tokens
    const deductResult = await deductTokens(
      session.user.id,
      tokenCost,
      'VOTE',
      nominationId,
      `${voteCount} votes for ${nomination.profile.firstName} ${nomination.profile.lastName} - ${award.title}`
    )

    if (!deductResult.success) {
      return res.status(500).json({ error: deductResult.error })
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VOTES_CAST',
        resource: 'votes',
        resourceId: result.vote.id,
        newData: JSON.stringify({
          nominationId,
          awardId: award.id,
          voteCount,
          tokenCost,
          playerName: `${nomination.profile.firstName} ${nomination.profile.lastName}`,
          awardTitle: award.title,
          newBalance: deductResult.newBalance
        })
      }
    })

    res.status(200).json({
      success: true,
      message: `Successfully cast ${voteCount} votes for ${nomination.profile.firstName} ${nomination.profile.lastName}`,
      vote: {
        id: result.vote.id,
        voteCount: result.vote.voteCount,
        tokenCost: result.vote.tokenCost,
        userTotalVotes: newTotalVotes
      },
      nomination: {
        id: nomination.id,
        newVoteCount: result.updatedNomination.voteCount
      },
      award: {
        title: award.title,
        maxVotesPerUser: award.maxVotesPerUser,
        tokenCostPerVote: award.tokenCostPerVote
      },
      tokensSpent: tokenCost,
      newBalance: deductResult.newBalance
    })

  } catch (error) {
    console.error('Voting error:', error)
    res.status(500).json({ error: 'Failed to process vote' })
  }
}