import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import prisma from '../../../lib/prisma'

// Email domain validation for coaches
const isValidSchoolDomain = (email: string): boolean => {
  const schoolDomains = [
    '.edu',
    '.k12.',
    '.schools.',
    '.school.',
    '.district.',
    'college.edu',
    'university.edu'
  ]
  
  const emailLower = email.toLowerCase()
  return schoolDomains.some(domain => emailLower.includes(domain))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password, role, profileData } = req.body

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' })
    }

    // Role-specific validation
    if (role === 'COACH' || role === 'Coach') {
      if (!profileData?.schoolEmail || !profileData?.schoolId) {
        return res.status(400).json({ 
          message: 'School email and school selection required for coach registration' 
        })
      }

      // Validate school email domain
      if (!isValidSchoolDomain(profileData.schoolEmail)) {
        return res.status(400).json({ 
          message: 'Coach email must be from a valid educational domain (.edu, .k12, .schools, etc.)' 
        })
      }
    }

    if (role === 'MEDIA' || role === 'Media') {
      if (!profileData?.mediaOutlet || !profileData?.mediaCredentials) {
        return res.status(400).json({ 
          message: 'Media outlet and credentials required for media registration' 
        })
      }
    }

    if (role === 'ATHLETE' || role === 'Athlete') {
      if (!profileData?.gradYear || !profileData?.schoolId) {
        return res.status(400).json({ 
          message: 'Graduation year and school selection required for athlete registration' 
        })
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Normalize role to uppercase for database consistency
    const normalizedRole = role.toUpperCase()

    // Determine verification status
    const verificationStatus = (normalizedRole === 'COACH' || normalizedRole === 'MEDIA') ? 'pending' : 'unverified'
    const verified = (normalizedRole === 'ATHLETE' || normalizedRole === 'PARENT' || normalizedRole === 'FAN' || normalizedRole === 'BUSINESS' || normalizedRole === 'ORGANIZATION')

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: normalizedRole,
        verified,
        verificationStatus,
        tokenBalance: normalizedRole === 'ATHLETE' ? 10 : 5, // Welcome bonus tokens
      }
    })

    // Create profile with role-specific data
    const profileCreateData: any = {
      userId: user.id,
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      verified: verified,
      verificationStatus: verificationStatus === 'pending' ? 'pending' : undefined,
    }

    // Role-specific profile data
    if (normalizedRole === 'ATHLETE') {
      profileCreateData.graduationYear = parseInt(profileData.gradYear)
      profileCreateData.position = profileData.position
      profileCreateData.schoolId = profileData.schoolId
      profileCreateData.additionalInfo = profileData.athleteOrganization || null
    }

    if (normalizedRole === 'COACH') {
      profileCreateData.schoolId = profileData.schoolId
      profileCreateData.schoolEmail = profileData.schoolEmail
      profileCreateData.communicationEmail = profileData.communicationEmail
      profileCreateData.verificationSubmittedAt = new Date()
      // Set default privileges (will be activated after admin approval)
      profileCreateData.teamAdminPrivileges = false
      profileCreateData.canVerifyStats = false
      profileCreateData.canManageTeam = false
      profileCreateData.canCreateAwards = false
    }

    if (normalizedRole === 'MEDIA') {
      profileCreateData.mediaOutlet = profileData.mediaOutlet
      profileCreateData.mediaCredentials = profileData.mediaCredentials
      profileCreateData.verificationSubmittedAt = new Date()
      // Set default privileges (will be activated after admin approval)
      profileCreateData.canCreateSpotlights = false
      profileCreateData.canCreateAwards = false
      profileCreateData.mediaVerified = false
    }

    if (normalizedRole === 'ORGANIZATION') {
      profileCreateData.additionalInfo = profileData.organization
    }

    if (normalizedRole === 'BUSINESS') {
      profileCreateData.additionalInfo = profileData.businessName
    }

    // Create profile
    await prisma.profile.create({
      data: profileCreateData
    })

    // Create welcome token transaction
    await prisma.tokenTransaction.create({
      data: {
        userId: user.id,
        type: 'EARNED',
        amount: normalizedRole === 'ATHLETE' ? 10 : 5,
        balance: normalizedRole === 'ATHLETE' ? 10 : 5,
        source: 'REGISTRATION',
        description: 'Welcome bonus tokens'
      }
    })

    // Create notification for pending verifications
    if (verificationStatus === 'pending') {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'VERIFICATION_SUBMITTED',
          title: 'Verification Submitted',
          message: `Your ${normalizedRole.toLowerCase()} verification has been submitted and is pending admin review. You will be notified once approved.`,
          read: false
        }
      }).catch(err => console.error('Notification creation failed:', err))
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.verified,
        verificationStatus: user.verificationStatus
      },
      tokensAwarded: normalizedRole === 'ATHLETE' ? 10 : 5,
      requiresVerification: verificationStatus === 'pending'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}