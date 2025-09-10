// pages/api/admin/users.ts
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

    const { page = '1', limit = '50', role, status, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause
    const where: any = {};
    
    if (role && role !== 'all') {
      where.role = role;
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        where.isVerified = true;
      } else if (status === 'pending') {
        where.isVerified = false;
      }
      // Add suspended logic when you implement it
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        school: true,
        organization: true,
        createdAt: true,
        lastLogin: true,
        // Don't include password or sensitive data
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    // Map to include status field
    const usersWithStatus = users.map(user => ({
      ...user,
      status: user.isVerified ? 'active' : 'pending'
    }));

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}