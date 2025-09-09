import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../lib/prisma'

const authOptions = require('../auth/[...nextauth]').default

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions) as any
    
    if (!session?.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    if (session.user.role?.toLowerCase() !== 'athlete') {
      return res.status(403).json({ message: 'Only athletes can view their stats' })
    }

    const stats = await prisma.stat.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        gameDate: 'desc'
      },
      take: 10,
      include: {
        team: true
      }
    })

    res.status(200).json({ stats })

  } catch (error) {
    console.error('Recent stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}