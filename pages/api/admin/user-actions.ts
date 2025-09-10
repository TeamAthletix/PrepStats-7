// pages/api/admin/user-actions.ts
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

    const { userId, action, privileges } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let updateData: any = {};

    switch (action) {
      case 'verify':
        updateData = {
          isVerified: true,
          verifiedAt: new Date(),
          ...(privileges && { privileges })
        };
        
        // Add role-specific privileges
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        });

        if (user?.role === 'coach') {
          updateData.privileges = {
            canVerifyStats: true,
            canManageTeam: true,
            canCreateAwards: true,
            ...privileges
          };
        } else if (user?.role === 'media') {
          updateData.privileges = {
            canCreateContent: true,
            canAccessInterviews: true,
            ...privileges
          };
        }
        break;

      case 'suspend':
        updateData = {
          isVerified: false,
          suspendedAt: new Date(),
          suspendedBy: session.user.id,
          privileges: null
        };
        break;

      case 'reactivate':
        updateData = {
          isVerified: true,
          suspendedAt: null,
          suspendedBy: null
        };
        break;

      case 'update_role':
        const { newRole } = req.body;
        if (!newRole) {
          return res.status(400).json({ message: 'New role required' });
        }
        updateData = { role: newRole };
        break;

      case 'update_privileges':
        if (!privileges) {
          return res.status(400).json({ message: 'Privileges required' });
        }
        updateData = { privileges };
        break;

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        privileges: true,
        updatedAt: true
      }
    });

    // Log the admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: `user_${action}`,
        targetUserId: userId,
        details: {
          action,
          changes: updateData,
          timestamp: new Date()
        }
      }
    }).catch(() => {
      // If adminLog table doesn't exist yet, just continue
      console.log('AdminLog table not found - skipping log entry');
    });

    res.status(200).json({
      message: `User ${action} successful`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin user action error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}