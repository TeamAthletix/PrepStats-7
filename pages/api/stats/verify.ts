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
    
    if (!session?.user || session.user.role?.toLowerCase() !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can verify stats' })
    }

    const { statId, verified, notes } = req.body

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ message: 'Verified status required' })
    }

    const stat = await prisma.stat.update({
      where: { id: statId },
      data: {
        verified,
        verifiedBy: session.user.id,
        verifierRole: 'COACH'
      }
    })

    res.status(200).json({ message: 'Stat verification updated', stat })

  } catch (error) {
    console.error('Stat verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
