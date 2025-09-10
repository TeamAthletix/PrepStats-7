// pages/api/admin/bulk-actions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array required' });
    }

    if (!action) {
      return res.status(400).json({ message: 'Action required' });
    }

    // Prevent admin from performing bulk actions on themselves
    const filteredUserIds = userIds.filter(id => id !== session.user.id);
    
    if (filteredUserIds.length === 0) {
      return res.status(400).json({ message: 'Cannot perform bulk actions on your own account' });
    }

    let results = [];

    switch (action) {
      case 'verify':
        const verifiedUsers = await prisma.user.updateMany({
          where: {
            id: { in: filteredUserIds },
            isVerified: false
          },
          data: {
            isVerified: true,
            verifiedAt: new Date()
          }
        });

        // For coaches, add privileges
        await prisma.user.updateMany({
          where: {
            id: { in: filteredUserIds },
            role: 'coach',
            isVerified: true
          },
          data: {
            privileges: {
              canVerifyStats: true,
              canManageTeam: true,
              canCreateAwards: true
            }
          }
        });

        // For media, add privileges
        await prisma.user.updateMany({
          where: {
            id: { in: filteredUserIds },
            role: 'media',
            isVerified: true
          },
          data: {
            privileges: {
              canCreateContent: true,
              canAccessInterviews: true
            }
          }
        });

        results.push(`Verified ${verifiedUsers.count} users`);
        break;

      case 'suspend':
        const suspendedUsers = await prisma.user.updateMany({
          where: {
            id: { in: filteredUserIds }
          },
          data: {
            isVerified: false,
            suspendedAt: new Date(),
            suspendedBy: session.user.id,
            privileges: null
          }
        });

        results.push(`Suspended ${suspendedUsers.count} users`);
        break;

      case 'delete':
        // Get user info before deletion for logging
        const usersToDelete = await prisma.user.findMany({
          where: { id: { in: filteredUserIds } },
          select: { id: true, email: true, name: true, role: true }
        });

        // Perform bulk deletion in transaction
        await prisma.$transaction(async (tx) => {
          // Delete related data first
          await tx.gameStat.deleteMany({
            where: { userId: { in: filteredUserIds } }
          }).catch(() => console.log('GameStat table not found - skipping'));

          await tx.teamMember.deleteMany({
            where: { userId: { in: filteredUserIds } }
          }).catch(() => console.log('TeamMember table not found - skipping'));

          await tx.award.deleteMany({
            where: { userId: { in: filteredUserIds } }
          }).catch(() => console.log('Award table not found - skipping'));

          // Delete users
          const deletedUsers = await tx.user.deleteMany({
            where: { id: { in: filteredUserIds } }
          });

          // Log bulk deletion
          await tx.adminLog.create({
            data: {
              adminId: session.user.id,
              action: 'bulk_delete',
              details: {
                deletedUsers: usersToDelete,
                count: deletedUsers.count,
                timestamp: new Date()
              }
            }
          }).catch(() => console.log('AdminLog table not found - skipping'));

          results.push(`Deleted ${deletedUsers.count} users`);
        });
        break;

      case 'change_role':
        const { newRole } = req.body;
        if (!newRole) {
          return res.status(400).json({ message: 'New role required for role change' });
        }

        const roleChangedUsers = await prisma.user.updateMany({
          where: { id: { in: filteredUserIds } },
          data: { role: newRole }
        });

        results.push(`Changed role to ${newRole} for ${roleChangedUsers.count} users`);
        break;

      default:
        return res.status(400).json({ message: 'Invalid bulk action' });
    }

    // Log the bulk action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: `bulk_${action}`,
        details: {
          userIds: filteredUserIds,
          action,
          results,
          timestamp: new Date()
        }
      }
    }).catch(() => {
      console.log('AdminLog table not found - skipping log entry');
    });

    res.status(200).json({
      message: 'Bulk action completed successfully',
      results,
      processedCount: filteredUserIds.length
    });
  } catch (error) {
    console.error('Admin bulk action error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}