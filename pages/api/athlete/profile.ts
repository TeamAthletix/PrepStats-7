// pages/api/athlete/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user?.role !== 'ATHLETE') {
      return res.status(403).json({ message: 'Athlete access required' });
    }

    if (req.method === 'GET') {
      const profile = await prisma.profile.findFirst({
        where: { userId: session.user.id },
        include: {
          school: true,
          team: true
        }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.status(200).json(profile);
    } 
    else if (req.method === 'PUT') {
      const { 
        firstName, 
        lastName, 
        graduationYear, 
        position, 
        jerseyNumber,
        height,
        weight,
        gpa,
        bio 
      } = req.body;

      const updatedProfile = await prisma.profile.updateMany({
        where: { userId: session.user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(graduationYear && { graduationYear: parseInt(graduationYear) }),
          ...(position && { position }),
          ...(jerseyNumber && { jerseyNumber: parseInt(jerseyNumber) }),
          ...(height && { height }),
          ...(weight && { weight }),
          ...(gpa && { gpa: parseFloat(gpa) }),
          ...(bio && { bio }),
          updatedAt: new Date()
        }
      });

      // Return updated profile
      const profile = await prisma.profile.findFirst({
        where: { userId: session.user.id },
        include: {
          school: true,
          team: true
        }
      });

      res.status(200).json(profile);
    } 
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Athlete profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}