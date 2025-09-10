// pages/api/athlete/tokens.ts
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
    
    if (!session || session.user?.role !== 'ATHLETE') {
      return res.status(403).json({ message: 'Athlete access required' });
    }

    // Get user's current token balance from User model
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tokenBalance: true }
    });

    // Get recent token transactions
    const transactions = await prisma.tokenTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.status(200).json({
      balance: user?.tokenBalance || 0,
      transactions
    });
  } catch (error) {
    console.error('Token fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}