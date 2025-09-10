// pages/api/admin/pending-users.ts (Enhanced Version)
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

    const pendingUsers = await prisma.user.findMany({
      where: {
        isVerified: false,
        suspendedAt: null // Don't show suspended users in pending
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        school: true,
        organization: true,
        createdAt: true,
        isVerified: true,
        // Include any additional verification data
        verificationData: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add status field and format response
    const formattedPendingUsers = pendingUsers.map(user => ({
      ...user,
      status: 'pending'
    }));

    res.status(200).json(formattedPendingUsers);
  } catch (error) {
    console.error('Pending users fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}