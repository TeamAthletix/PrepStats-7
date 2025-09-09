import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['ADMIN'])
  if (!session) return

  try {
    const { userId, verified } = req.body

    if (!userId || typeof verified !== 'boolean') {
      return res.status(400).json({ message: 'User ID and verified status required' })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified }
    })

    res.status(200).json({ 
      message: `User ${verified ? 'verified' : 'unverified'} successfully`, 
      user 
    })

  } catch (error) {
    console.error('User verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}