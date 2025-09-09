import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { Session } from 'next-auth'
import prisma from './prisma'

// Import NextAuth configuration
const authOptions = require('../pages/api/auth/[...nextauth]').default

// Extended session interface with our custom fields
interface ExtendedSession extends Session {
  user: {
    id: string
    email: string
    role: string
    tokenBalance: number
    subscriptionTier: string
    verified: boolean
    name?: string | null
    image?: string | null
  }
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  ADMIN: 100,
  BUSINESS: 90,
  MEDIA: 80,
  COACH: 70,
  PARENT: 60,
  ATHLETE: 50,
  GUEST: 10
}

/**
 * Require authentication and optionally check roles
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles?: string[]
): Promise<ExtendedSession | null> {
  try {
    const session = await getServerSession(req, res, authOptions) as ExtendedSession | null

    if (!session?.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      })
      return null
    }

    // Check role permissions if specified
    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: allowedRoles,
        current: session.user.role
      })
      return null
    }

    return session
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ 
      error: 'Authentication system error',
      code: 'AUTH_ERROR'
    })
    return null
  }
}

/**
 * Check if user has minimum role level
 */
export function hasMinimumRole(userRole: string, minimumRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0
  const minLevel = ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY] || 0
  return userLevel >= minLevel
}

/**
 * Get authenticated session without requiring it
 */
export async function getAuthSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ExtendedSession | null> {
  try {
    const session = await getServerSession(req, res, authOptions) as ExtendedSession | null
    return session
  } catch (error) {
    console.error('Session retrieval error:', error)
    return null
  }
}

/**
 * Check if user can perform action based on token balance
 */
export async function checkTokenBalance(
  userId: string,
  requiredTokens: number
): Promise<{ canAfford: boolean; currentBalance: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true }
  })

  const currentBalance = user?.tokenBalance || 0
  return {
    canAfford: currentBalance >= requiredTokens,
    currentBalance
  }
}

/**
 * Deduct tokens from user balance with transaction logging
 */
export async function deductTokens(
  userId: string,
  amount: number,
  source: string,
  sourceId?: string,
  description?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true }
    })

    if (!user || user.tokenBalance < amount) {
      return {
        success: false,
        newBalance: user?.tokenBalance || 0,
        error: 'Insufficient token balance'
      }
    }

    const newBalance = user.tokenBalance - amount

    // Update user balance and create transaction record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { tokenBalance: newBalance }
      }),
      prisma.tokenTransaction.create({
        data: {
          userId,
          type: 'SPENT',
          amount: -amount,
          balance: newBalance,
          source,
          sourceId,
          description: description || `Spent ${amount} tokens for ${source}`
        }
      })
    ])

    return {
      success: true,
      newBalance
    }
  } catch (error) {
    console.error('Token deduction error:', error)
    return {
      success: false,
      newBalance: 0,
      error: 'Failed to process token transaction'
    }
  }
}

/**
 * Award tokens to user with transaction logging
 */
export async function awardTokens(
  userId: string,
  amount: number,
  source: string,
  sourceId?: string,
  description?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true }
    })

    const currentBalance = user?.tokenBalance || 0
    const newBalance = currentBalance + amount

    // Update user balance and create transaction record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { tokenBalance: newBalance }
      }),
      prisma.tokenTransaction.create({
        data: {
          userId,
          type: 'EARNED',
          amount,
          balance: newBalance,
          source,
          sourceId,
          description: description || `Earned ${amount} tokens from ${source}`
        }
      })
    ])

    return {
      success: true,
      newBalance
    }
  } catch (error) {
    console.error('Token award error:', error)
    return {
      success: false,
      newBalance: 0,
      error: 'Failed to process token transaction'
    }
  }
}
