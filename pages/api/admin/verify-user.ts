import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['ADMIN'])
  if (!session) return

  const { userId, approved } = req.body

  try {
    if (approved) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          verified: true,
          isTrusted: true
        }
      })
    } else {
      await prisma.user.delete({
        where: { id: userId }
      })
    }

    res.json({ message: 'User verification updated' })
  } catch (error) {
    console.error('Error verifying user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
