import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getSession({ req })
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const { statId, verified, verificationNote } = req.body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profiles: true }
    })

    const profile = user?.profiles[0]
    if (!user?.verified || user.role !== 'COACH' || !profile?.canVerifyStats) {
      return res.status(403).json({ message: 'Insufficient stat verification privileges' })
    }

    const stat = await prisma.stat.findUnique({
      where: { id: statId },
      include: {
        profile: {
          include: {
            team: true
          }
        }
      }
    })

    if (!stat) {
      return res.status(404).json({ message: 'Stat not found' })
    }

    if (stat.profile.team?.coachId !== session.user.id) {
      return res.status(403).json({ message: 'Can only verify stats for your team athletes' })
    }

    const updatedStat = await prisma.stat.update({
      where: { id: statId },
      data: {
        verified: verified,
        verifiedAt: verified ? new Date() : null,
        verifiedById: verified ? session.user.id : null,
        verificationNote: verificationNote || null
      },
      include: {
        profile: true,
        verifiedBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (verified) {
      await prisma.tokenTransaction.create({
        data: {
          userId: stat.profile.userId,
          type: 'EARNED',
          amount: 5,
          balance: 0,
          source: 'STAT_VERIFICATION',
          sourceId: statId,
          description: 'Stat verified by coach'
        }
      })

      await prisma.user.update({
        where: { id: stat.profile.userId },
        data: {
          tokenBalance: {
            increment: 5
          }
        }
      })
    }

    res.json({
      message: `Stat ${verified ? 'verified' : 'rejected'} successfully`,
      stat: updatedStat,
      tokensAwarded: verified ? 5 : 0
    })

  } catch (error) {
    console.error('Error verifying stat:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}