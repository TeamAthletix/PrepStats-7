import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['COACH'])
  if (!session) return

  try {
    const stats = await prisma.stat.findMany({
      where: {
        verified: false
      },
      include: {
        profile: {
          include: {
            team: true
          }
        },
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ stats })
  } catch (error) {
    console.error('Error fetching pending stats:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
