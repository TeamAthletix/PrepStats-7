// pages/api/admin/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get platform statistics
    const [
      totalUsers,
      pendingVerifications,
      activeUsers,
      roleBreakdown,
      recentActivity
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Pending verifications count  
      prisma.user.count({
        where: { isVerified: false }
      }),
      
      // Active users (verified and logged in within last 30 days)
      prisma.user.count({
        where: {
          isVerified: true,
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }),
      
      // Role breakdown
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      
      // Recent activity (users created in last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        }
      })
    ]);

    // Format role breakdown
    const roleStats = roleBreakdown.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalUsers,
      pendingVerifications,
      activeUsers,
      roleBreakdown: roleStats,
      recentActivity
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}