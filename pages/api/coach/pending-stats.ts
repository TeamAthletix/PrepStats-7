import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['COACH'])
  if (!session) return

  try {
    const pendingStats = await prisma.stat.findMany({
      where: {
        verified: false
      },
      include: {
        user: {
          select: {
            email: true,
            profiles: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json({ stats: pendingStats })

  } catch (error) {
    console.error('Pending stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
