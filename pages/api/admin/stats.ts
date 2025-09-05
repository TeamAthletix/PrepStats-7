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
    const [totalUsers, pendingVerifications, totalStats, activeSpotlights] = await Promise.all([
      prisma.user.count(),
      prisma.stat.count({ where: { verified: false } }),
      prisma.stat.count(),
      prisma.spotlight.count({ where: { active: true } })
    ])

    res.json({
      totalUsers,
      pendingVerifications,
      totalStats,
      activeSpotlights
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
