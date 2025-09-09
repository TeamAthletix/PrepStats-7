import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import prisma from '../../../lib/prisma'
import { awardTokens } from '../../../lib/auth'

interface RegisterRequest {
  email: string
  password: string
  role: string
  firstName?: string
  lastName?: string
  state?: string
  location?: string
  schoolId?: string
  verificationData?: any
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      state = 'Alabama',
      location,
      schoolId,
      verificationData
    }: RegisterRequest = req.body

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ 
        error: 'Email, password, and role are required' 
      })
    }

    const validRoles = ['ATHLETE', 'COACH', 'PARENT', 'MEDIA', 'ADMIN', 'BUSINESS']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role specified' 
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists with this email' 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine initial verification status
    const needsVerification = ['COACH', 'MEDIA'].includes(role)
    
    // Create user with role-specific defaults
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        state,
        location,
        verified: !needsVerification,
        verificationData: verificationData ? JSON.stringify(verificationData) : null,
        tokenBalance: 0 // Will be awarded after creation
      }
    })

    // Award signup bonus tokens based on role
    const signupBonus = getSignupBonus(role)
    if (signupBonus > 0) {
      await awardTokens(
        user.id,
        signupBonus,
        'SIGNUP',
        user.id,
        `Welcome bonus for ${role} signup`
      )
    }

    // Create profile for athletes
    if (role === 'ATHLETE' && firstName && lastName) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          schoolId,
          public: true
        }
      })
    }

    // Create coach verification record if needed
    if (role === 'COACH' && needsVerification) {
      await prisma.coachVerification.create({
        data: {
          userId: user.id,
          schoolId,
          status: 'PENDING',
          ...verificationData
        }
      })
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        resource: 'users',
        resourceId: user.id,
        newData: JSON.stringify({
          role,
          verified: user.verified,
          state
        })
      }
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.verified,
        tokenBalance: signupBonus,
        needsVerification
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    })
  }
}

function getSignupBonus(role: string): number {
  const bonuses = {
    ATHLETE: 10,
    COACH: 15,
    PARENT: 5,
    MEDIA: 20,
    ADMIN: 0,
    BUSINESS: 0
  }
  return bonuses[role as keyof typeof bonuses] || 0
}
