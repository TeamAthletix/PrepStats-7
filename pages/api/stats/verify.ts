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

  if (!['COACH', 'MEDIA', 'ADMIN'].includes(session.user.role)) {
    return res.status(403).json({ message: 'Permission denied' })
  }

  const { statIds, approved } = req.body

  try {
    const updatedStats = await prisma.stat.updateMany({
      where: {
        id: { in: statIds }
      },
      data: {
        verified: approved,
        verifiedBy: session.user.id,
        verifierRole: session.user.role,
        updatedAt: new Date()
      }
    })

    if (approved) {
      const stats = await prisma.stat.findMany({
        where: { id: { in: statIds } },
        include: { user: true }
      })

      for (const stat of stats) {
        await prisma.user.update({
          where: { id: stat.userId },
          data: { tokens: { increment: 2 } }
        })

        await prisma.tokenTransaction.create({
          data: {
            userId: stat.userId,
            type: 'EARNED',
            amount: 2,
            description: 'Stat verification reward'
          }
        })
      }
    }

    res.json({ message: `${updatedStats.count} stats updated` })
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
