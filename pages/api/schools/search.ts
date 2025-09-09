import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { q, state, limit = 10 } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Query parameter "q" is required' })
    }

    // Build search conditions for SQLite (case-insensitive search)
    const searchQuery = q.toLowerCase()
    
    let whereCondition: any = {
      OR: [
        {
          name: {
            contains: searchQuery
          }
        },
        {
          city: {
            contains: searchQuery
          }
        }
      ]
    }

    // Add state filter if provided
    if (state && typeof state === 'string' && state !== 'ALL') {
      whereCondition.state = state
    }

    const schools = await prisma.school.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        classification: true
      },
      orderBy: {
        name: 'asc'
      },
      take: parseInt(limit as string)
    })

    res.status(200).json({ schools })
  } catch (error) {
    console.error('School search error:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
