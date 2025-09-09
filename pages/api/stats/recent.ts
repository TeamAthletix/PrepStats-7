import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    if (session.user.role?.toLowerCase() !== 'athlete') {
      return res.status(403).json({ message: 'Only athletes can view their stats' })
    }

    const stats = await prisma.stats.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        gameDate: 'desc'
      },
      take: 10
    })

    res.status(200).json({ stats })

  } catch (error) {
    console.error('Error fetching recent stats:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
