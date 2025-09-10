// pages/api/athlete/stats.ts
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
      // Get user's profile first
      const profile = await prisma.profile.findFirst({
        where: { userId: session.user.id }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Get stats for this profile
      const stats = await prisma.stat.findMany({
        where: { profileId: profile.id },
        include: {
          verifiedBy: {
            select: { id: true, email: true }
          }
        },
        orderBy: { gameDate: 'desc' }
      });

      res.status(200).json(stats);
    }
    else if (req.method === 'POST') {
      // Create new stat entry
      const {
        sport,
        gameDate,
        opponent,
        week,
        season,
        isHome,
        gameResult,
        metrics,
        mediaLink
      } = req.body;

      // Get user's profile
      const profile = await prisma.profile.findFirst({
        where: { userId: session.user.id }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const newStat = await prisma.stat.create({
        data: {
          createdById: session.user.id,
          profileId: profile.id,
          teamId: profile.teamId,
          sport: sport || 'FOOTBALL',
          gameDate: new Date(gameDate),
          opponent,
          season: season || new Date().getFullYear().toString(),
          week: week ? parseInt(week) : null,
          isHome: isHome !== false, // Default to true
          gameResult,
          metrics: JSON.stringify(metrics),
          mediaLink,
          verified: false
        }
      });

      res.status(201).json({
        message: 'Stats submitted successfully',
        stat: newStat
      });
    }
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Athlete stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}