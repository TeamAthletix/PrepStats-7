import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profiles: {
          include: {
            school: true,
            team: true
          }
        },
        tokenTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get verification status for coaches/media
    let verificationStatus = null
    if (['COACH', 'MEDIA'].includes(user.role)) {
      verificationStatus = await prisma.coachVerification.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.verified,
        tokenBalance: user.tokenBalance,
        subscriptionTier: user.subscriptionTier,
        state: user.state,
        location: user.location,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      },
      profiles: user.profiles,
      recentTransactions: user.tokenTransactions,
      verificationStatus
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}
