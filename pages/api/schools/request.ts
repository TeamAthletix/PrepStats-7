import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { schoolName, city, state, classification } = req.body

    if (!schoolName || !city || !state) {
      return res.status(400).json({ 
        message: 'School name, city, and state are required' 
      })
    }

    // Check if school already exists
    const existingSchool = await prisma.school.findFirst({
      where: {
        name: {
          equals: schoolName,
          mode: 'insensitive'
        },
        city: {
          equals: city,
          mode: 'insensitive'
        },
        state: {
          equals: state,
          mode: 'insensitive'
        }
      }
    })

    if (existingSchool) {
      return res.status(400).json({ 
        message: 'School already exists in our database' 
      })
    }

    // Check if there's already a pending request for this school
    const existingRequest = await prisma.schoolRequest.findFirst({
      where: {
        schoolName: {
          equals: schoolName,
          mode: 'insensitive'
        },
        city: {
          equals: city,
          mode: 'insensitive'
        },
        state: {
          equals: state,
          mode: 'insensitive'
        },
        status: 'pending'
      }
    })

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'A request for this school is already pending review' 
      })
    }

    // Create school request
    const schoolRequest = await prisma.schoolRequest.create({
      data: {
        schoolName,
        city,
        state,
        classification: classification || null,
        requestedBy: session.user.id,
        status: 'pending'
      }
    })

    res.status(201).json({ 
      message: 'School request submitted successfully',
      request: schoolRequest 
    })
  } catch (error) {
    console.error('School request error:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
