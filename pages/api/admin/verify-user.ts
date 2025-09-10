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
    const { userId, verified, rejectReason, grantPrivileges } = req.body

    if (!userId || typeof verified !== 'boolean') {
      return res.status(400).json({ message: 'User ID and verified status required' })
    }

    // Get user with profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const profile = user.profiles[0]

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        verified,
        verificationStatus: verified ? 'approved' : 'rejected'
      }
    })

    // Update profile with verification details
    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          verificationStatus: verified ? 'approved' : 'rejected',
          verificationCompletedAt: new Date(),
          rejectReason: verified ? null : rejectReason,
          // Grant team admin privileges for verified coaches
          teamAdminPrivileges: (verified && user.role === 'COACH') ? true : false
        }
      })
    }

    // For verified coaches: Link to school and grant team management
    if (verified && user.role === 'COACH' && profile?.schoolId) {
      try {
        // Create or update team association
        await prisma.team.upsert({
          where: {
            schoolId_sport: {
              schoolId: profile.schoolId,
              sport: 'FOOTBALL' // Default sport, can be enhanced later
            }
          },
          update: {
            coachId: userId,
            coachVerified: true
          },
          create: {
            schoolId: profile.schoolId,
            sport: 'FOOTBALL',
            coachId: userId,
            coachVerified: true,
            name: `${profile.schoolId} Football Team` // Will need actual school name
          }
        })

        // Grant specific privileges
        await prisma.profile.update({
          where: { id: profile.id },
          data: {
            canVerifyStats: true,
            canManageTeam: true,
            canCreateAwards: true,
            teamAdminPrivileges: true
          }
        })
      } catch (teamError) {
        console.error('Error creating team association:', teamError)
        // Continue with verification even if team creation fails
      }
    }

    // For verified media: Grant coverage privileges
    if (verified && user.role === 'MEDIA') {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          canCreateSpotlights: true,
          canCreateAwards: true,
          mediaVerified: true
        }
      })
    }

    // Create notification/audit log
    await prisma.notification.create({
      data: {
        userId: userId,
        type: verified ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
        title: verified ? 'Account Verified!' : 'Verification Rejected',
        message: verified 
          ? `Your ${user.role.toLowerCase()} account has been verified. You now have access to additional features.`
          : `Your verification was rejected. ${rejectReason || 'Please contact support for more information.'}`,
        read: false
      }
    }).catch(err => console.error('Notification creation failed:', err))

    res.status(200).json({ 
      message: `User ${verified ? 'verified' : 'rejected'} successfully`, 
      user: updatedUser,
      privilegesGranted: verified && user.role === 'COACH' ? [
        'Team Management',
        'Stat Verification', 
        'Award Creation'
      ] : verified && user.role === 'MEDIA' ? [
        'Spotlight Creation',
        'Award Creation'
      ] : []
    })

  } catch (error) {
    console.error('User verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}