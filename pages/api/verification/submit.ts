import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
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

  const session = await getSession({ req })
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const {
      role,
      schoolEmail,
      schoolId,
      mediaOutlet,
      mediaCredentials,
      communicationEmail,
      additionalInfo
    } = req.body

    // Validate required fields based on role
    if (role === 'COACH') {
      if (!schoolEmail || !schoolId) {
        return res.status(400).json({ 
          message: 'School email and school selection required for coach verification' 
        })
      }

      // Validate school email domain
      if (!isValidSchoolDomain(schoolEmail)) {
        return res.status(400).json({ 
          message: 'School email must be from a valid educational domain (.edu, .k12, .schools, etc.)' 
        })
      }
    }

    if (role === 'MEDIA') {
      if (!mediaOutlet || !mediaCredentials) {
        return res.status(400).json({ 
          message: 'Media outlet and credentials required for media verification' 
        })
      }
    }

    // Check if user already has pending verification
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profiles: true }
    })

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (existingUser.verified) {
      return res.status(400).json({ message: 'User is already verified' })
    }

    // Update or create profile with verification info
    const profileData: any = {
      schoolEmail: role === 'COACH' ? schoolEmail : null,
      schoolId: role === 'COACH' ? schoolId : null,
      communicationEmail: communicationEmail || null,
      mediaOutlet: role === 'MEDIA' ? mediaOutlet : null,
      mediaCredentials: role === 'MEDIA' ? mediaCredentials : null,
      verificationStatus: 'pending',
      verificationSubmittedAt: new Date(),
      additionalInfo: additionalInfo || null
    }

    // Update existing profile or create new one
    const profile = existingUser.profiles[0]
    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: profileData
      })
    } else {
      await prisma.profile.create({
        data: {
          ...profileData,
          userId: session.user.id
        }
      })
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        verificationStatus: 'pending',
        role: role
      }
    })

    // Auto-approve coaches with valid school domains (optional enhancement)
    let autoApproved = false
    if (role === 'COACH' && isValidSchoolDomain(schoolEmail)) {
      // For now, still require manual approval
      // In future, could auto-approve certain trusted domains
      autoApproved = false
    }

    res.status(200).json({
      message: autoApproved 
        ? 'Verification approved automatically!' 
        : 'Verification request submitted successfully. You will be notified once reviewed.',
      status: autoApproved ? 'approved' : 'pending',
      verificationId: profile?.id || 'created'
    })

  } catch (error) {
    console.error('Verification submission error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}