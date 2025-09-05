import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['ADMIN'])
  if (!session) return

  try {
    const users = await prisma.user.findMany({
      where: {
        verified: false,
        role: { in: ['COACH', 'MEDIA'] }
      },
      include: {
        profiles: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ users })
  } catch (error) {
    console.error('Error fetching pending users:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
