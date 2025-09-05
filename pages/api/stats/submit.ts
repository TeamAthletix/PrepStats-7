import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { 
    profileId, sport, gameDate, opponent, season, week,
    isHome, gameResult, metrics, mediaLink, teamId 
  } = req.body

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    })

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    const canSubmit = profile.userId === session.user.id || 
                     session.user.role === 'COACH' || 
                     session.user.role === 'ADMIN'

    if (!canSubmit) {
      return res.status(403).json({ message: 'Permission denied' })
    }

    const autoVerify = session.user.role === 'COACH' || 
                      session.user.role === 'ADMIN' || 
                      session.user.isTrusted

    const stat = await prisma.stat.create({
      data: {
        userId: session.user.id,
        profileId,
        teamId,
        sport,
        gameDate: new Date(gameDate),
        opponent,
        season,
        week,
        isHome,
        gameResult,
        metrics,
        mediaLink,
        verified: autoVerify,
        verifiedBy: autoVerify ? session.user.id : null,
        verifierRole: autoVerify ? session.user.role : null,
        createdBy: session.user.id
      }
    })

    if (!autoVerify) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { tokens: { increment: 1 } }
      })

      await prisma.tokenTransaction.create({
        data: {
          userId: session.user.id,
          type: 'EARNED',
          amount: 1,
          description: 'Stat submission'
        }
      })
    }

    res.status(201).json({ stat })
  } catch (error) {
    console.error('Stat submission error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
