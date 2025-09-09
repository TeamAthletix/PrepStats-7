import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    if (session.user.role?.toLowerCase() !== 'athlete') {
      return res.status(403).json({ message: 'Only athletes can submit stats' })
    }

    const { gameData, stats } = req.body

    if (!gameData.opponent || !gameData.gameDate) {
      return res.status(400).json({ message: 'Opponent and game date are required' })
    }

    const newStats = await prisma.stats.create({
      data: {
        userId: session.user.id,
        opponent: gameData.opponent,
        gameDate: new Date(gameData.gameDate),
        gameType: gameData.gameType || 'regular',
        homeAway: gameData.homeAway || 'home',
        result: gameData.result || 'win',
        playerScore: gameData.playerScore ? parseInt(gameData.playerScore) : null,
        opponentScore: gameData.opponentScore ? parseInt(gameData.opponentScore) : null,
        
        // Passing stats
        completions: stats.completions ? parseInt(stats.completions) : null,
        attempts: stats.attempts ? parseInt(stats.attempts) : null,
        passingYards: stats.passingYards ? parseInt(stats.passingYards) : null,
        passingTds: stats.passingTds ? parseInt(stats.passingTds) : null,
        interceptions: stats.interceptions ? parseInt(stats.interceptions) : null,
        
        // Rushing stats
        carries: stats.carries ? parseInt(stats.carries) : null,
        rushingYards: stats.rushingYards ? parseInt(stats.rushingYards) : null,
        rushingTds: stats.rushingTds ? parseInt(stats.rushingTds) : null,
        fumbles: stats.fumbles ? parseInt(stats.fumbles) : null,
        
        // Receiving stats
        receptions: stats.receptions ? parseInt(stats.receptions) : null,
        receivingYards: stats.receivingYards ? parseInt(stats.receivingYards) : null,
        receivingTds: stats.receivingTds ? parseInt(stats.receivingTds) : null,
        drops: stats.drops ? parseInt(stats.drops) : null,
        
        // Defense stats
        tackles: stats.tackles ? parseInt(stats.tackles) : null,
        assists: stats.assists ? parseInt(stats.assists) : null,
        sacks: stats.sacks ? parseFloat(stats.sacks) : null,
        defenseInts: stats.defenseInts ? parseInt(stats.defenseInts) : null,
        passBreakups: stats.passBreakups ? parseInt(stats.passBreakups) : null,
        forcedFumbles: stats.forcedFumbles ? parseInt(stats.forcedFumbles) : null
      }
    })

    res.status(201).json({ 
      message: 'Stats submitted successfully',
      statsId: newStats.id 
    })

  } catch (error) {
    console.error('Error submitting stats:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
