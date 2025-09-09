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
    const pendingUsers = await prisma.user.findMany({
      where: {
        verified: false
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profiles: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json({ users: pendingUsers })

  } catch (error) {
    console.error('Pending users error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}