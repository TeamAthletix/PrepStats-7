import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { 
      page = 1, 
      limit = 20, 
      type,
      source,
      startDate,
      endDate 
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = Math.min(parseInt(limit as string), 100) // Max 100 per request
    const offset = (pageNum - 1) * limitNum

    // Build filter conditions
    const where: any = {
      userId: session.user.id
    }

    if (type) {
      where.type = type
    }

    if (source) {
      where.source = source
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string)
      }
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.tokenTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          type: true,
          amount: true,
          balance: true,
          source: true,
          sourceId: true,
          description: true,
          stripePaymentId: true,
          createdAt: true
        }
      }),
      prisma.tokenTransaction.count({ where })
    ])

    // Get current user balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tokenBalance: true }
    })

    // Calculate summary statistics
    const summary = await getTransactionSummary(session.user.id)

    res.status(200).json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      currentBalance: user?.tokenBalance || 0,
      summary
    })

  } catch (error) {
    console.error('Token transaction history error:', error)
    res.status(500).json({ error: 'Failed to fetch transaction history' })
  }
}

async function getTransactionSummary(userId: string) {
  // Get summary for last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const summaryData = await prisma.tokenTransaction.groupBy({
    by: ['type'],
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo }
    },
    _sum: { amount: true },
    _count: true
  })

  const summary = {
    last30Days: {
      earned: 0,
      spent: 0,
      purchased: 0,
      totalTransactions: 0
    },
    allTime: {
      totalEarned: 0,
      totalSpent: 0,
      totalPurchased: 0,
      totalTransactions: 0
    }
  }

  // Process 30-day summary
  for (const item of summaryData) {
    const amount = item._sum.amount || 0
    const count = item._count

    summary.last30Days.totalTransactions += count

    switch (item.type) {
      case 'EARNED':
        summary.last30Days.earned += amount
        break
      case 'SPENT':
        summary.last30Days.spent += Math.abs(amount) // Make positive for display
        break
      case 'PURCHASED':
        summary.last30Days.purchased += amount
        break
    }
  }

  // Get all-time summary
  const allTimeSummary = await prisma.tokenTransaction.groupBy({
    by: ['type'],
    where: { userId },
    _sum: { amount: true },
    _count: true
  })

  for (const item of allTimeSummary) {
    const amount = item._sum.amount || 0
    const count = item._count

    summary.allTime.totalTransactions += count

    switch (item.type) {
      case 'EARNED':
        summary.allTime.totalEarned += amount
        break
      case 'SPENT':
        summary.allTime.totalSpent += Math.abs(amount)
        break
      case 'PURCHASED':
        summary.allTime.totalPurchased += amount
        break
    }
  }

  return summary
}