// pages/api/players/search.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Search for athlete profiles (using existing Profile model)
    const athleteProfiles = await prisma.profile.findMany({
      where: {
        type: 'ATHLETE', // or 'Athlete' - handle both cases
        public: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            verified: true
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    // Transform the data to create player objects with slugs
    const players = athleteProfiles.map(profile => {
      // Create URL-friendly slug from name
      const slug = `${profile.firstName}-${profile.lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      return {
        id: profile.id,
        slug: slug,
        firstName: profile.firstName,
        lastName: profile.lastName,
        school: profile.school || 'No School',
        position: profile.position || 'No Position',
        graduationYear: profile.gradYear,
        bio: profile.bio,
        verified: profile.user.verified,
        profileId: profile.id
      }
    })

    res.status(200).json({ 
      players,
      count: players.length 
    })

  } catch (error) {
    console.error('Error fetching players:', error)
    res.status(500).json({ message: 'Failed to fetch players' })
  }
}