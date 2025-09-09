import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthSession } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getAuthSession(req, res)
    
    if (!session?.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const { schoolName, city, state = 'Alabama' } = req.body

    if (!schoolName || !city) {
      return res.status(400).json({ error: 'School name and city are required' })
    }

    // Create school request
    const schoolRequest = await prisma.schoolRequest.create({
      data: {
        schoolName: schoolName.trim(),
        city: city.trim(),
        state: state.trim(),
        requestedBy: session.user.id,
        status: 'pending'
      }
    })

    res.status(201).json({
      message: 'School request submitted successfully',
      request: {
        id: schoolRequest.id,
        schoolName: schoolRequest.schoolName,
        city: schoolRequest.city,
        state: schoolRequest.state,
        status: schoolRequest.status
      }
    })

  } catch (error) {
    console.error('School request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}