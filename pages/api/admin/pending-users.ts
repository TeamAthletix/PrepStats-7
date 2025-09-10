import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['ADMIN'])
  if (!session) return

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { verified: false },
          { verificationStatus: 'pending' }
        ],
        role: { in: ['COACH', 'MEDIA'] }
      },
      include: {
        profiles: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
                classification: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the data for admin review
    const formattedUsers = users.map(user => {
      const profile = user.profiles[0]
      
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profile ? `${profile.firstName} ${profile.lastName}` : 'No profile',
        createdAt: user.createdAt,
        verificationStatus: user.verificationStatus || 'unverified',
        
        // Coach-specific verification info
        ...(user.role === 'COACH' && profile && {
          schoolInfo: profile.school ? {
            name: profile.school.name,
            city: profile.school.city,
            state: profile.school.state,
            classification: profile.school.classification
          } : null,
          schoolEmail: profile.schoolEmail,
          communicationEmail: profile.communicationEmail,
          verificationSubmittedAt: profile.verificationSubmittedAt,
          isValidSchoolDomain: profile.schoolEmail ? 
            ['.edu', '.k12.', '.schools.', '.school.', '.district.'].some(domain => 
              profile.schoolEmail.toLowerCase().includes(domain)
            ) : false
        }),

        // Media-specific verification info
        ...(user.role === 'MEDIA' && profile && {
          mediaOutlet: profile.mediaOutlet,
          mediaCredentials: profile.mediaCredentials,
          verificationSubmittedAt: profile.verificationSubmittedAt
        }),

        // General profile info
        profileInfo: profile ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          gradYear: profile.gradYear,
          position: profile.position,
          additionalInfo: profile.additionalInfo
        } : null
      }
    })

    // Group by verification status for easier admin management
    const grouped = {
      pending: formattedUsers.filter(u => u.verificationStatus === 'pending'),
      unverified: formattedUsers.filter(u => u.verificationStatus !== 'pending'),
      coaches: formattedUsers.filter(u => u.role === 'COACH'),
      media: formattedUsers.filter(u => u.role === 'MEDIA')
    }

    res.json({ 
      users: formattedUsers,
      grouped,
      counts: {
        total: formattedUsers.length,
        pending: grouped.pending.length,
        coaches: grouped.coaches.length,
        media: grouped.media.length
      }
    })

  } catch (error) {
    console.error('Error fetching pending users:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}