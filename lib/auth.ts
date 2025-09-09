import { getServerSession } from 'next-auth'
import authOptions from '../pages/api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'

export async function requireAuth(req: NextApiRequest, res: NextApiResponse, roles?: string[]) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    res.status(401).json({ message: 'Unauthorized' })
    return null
  }

  if (roles && !roles.includes(session.user.role)) {
    res.status(403).json({ message: 'Access denied' })
    return null
  }

  return session
}
