import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        team: true
      }
    })

    res.json({ profiles })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
