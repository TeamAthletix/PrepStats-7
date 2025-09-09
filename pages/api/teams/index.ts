import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { state = 'Alabama', sport = 'FOOTBALL' } = req.query

  try {
    const teams = await prisma.team.findMany({
      where: {
        state: state as string,
        sport: sport as any
      },
      orderBy: {
        name: 'asc'
      }
    })

    res.json({ teams })
  } catch (error) {
    console.error('Error fetching teams:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
