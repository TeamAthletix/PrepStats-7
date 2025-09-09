import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['ADMIN'])
  if (!session) return

  try {
    const stats = await prisma.stat.findMany({
      include: {
        user: {
          select: {
            email: true,
            verified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    })

    res.status(200).json({ stats })

  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}