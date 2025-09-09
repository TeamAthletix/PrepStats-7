import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../lib/prisma'

const authOptions = require('../auth/[...nextauth]').default

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions) as any
    
    if (!session?.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const { sport, gameDate, opponent, metrics, teamId, profileId } = req.body

    if (!sport || !gameDate || !opponent || !metrics || !profileId) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const stat = await prisma.stat.create({
      data: {
        userId: session.user.id,
        profileId,
        sport,
        gameDate: new Date(gameDate),
        opponent,
        metrics: JSON.stringify(metrics),
        teamId,
        season: new Date(gameDate).getFullYear().toString(),
        createdBy: session.user.id,
        verified: false
      }
    })

    res.status(201).json({ message: 'Stat submitted successfully', stat })

  } catch (error) {
    console.error('Stat submission error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
