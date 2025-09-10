// pages/api/admin/delete-user.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Get user info before deletion for logging
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's stats (if they exist)
      await tx.gameStat.deleteMany({
        where: { userId }
      }).catch(() => {
        // Table might not exist yet
        console.log('GameStat table not found - skipping');
      });

      // Delete user's team memberships (if they exist)
      await tx.teamMember.deleteMany({
        where: { userId }
      }).catch(() => {
        // Table might not exist yet
        console.log('TeamMember table not found - skipping');
      });

      // Delete user's awards (if they exist)
      await tx.award.deleteMany({
        where: { userId }
      }).catch(() => {
        // Table might not exist yet
        console.log('Award table not found - skipping');
      });

      // Delete the user account
      await tx.user.delete({
        where: { id: userId }
      });

      // Log the deletion
      await tx.adminLog.create({
        data: {
          adminId: session.user.id,
          action: 'user_delete',
          targetUserId: userId,
          details: {
            deletedUser: userToDelete,
            timestamp: new Date()
          }
        }
      }).catch(() => {
        // If adminLog table doesn't exist yet, just continue
        console.log('AdminLog table not found - skipping log entry');
      });
    });

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        name: userToDelete.name
      }
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}