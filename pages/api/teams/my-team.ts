// File 1: pages/api/teams/my-team.ts (FIXED VERSION)

import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getMyTeam(req, res)
  } else if (req.method === 'POST') {
    return updateMyTeam(req, res)
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}

async function getMyTeam(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res, ['COACH'])
  if (!session) return

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profiles: {
          include: {
            school: true
          }
        }
      }
    })

    if (!user || !user.verified) {
      return res.status(403).json({ message: 'Must be a verified coach to access team management' })
    }

    const profile = user.profiles[0]
    if (!profile?.canManageTeam || !profile.schoolId) {
      return res.status(403).json({ message: 'No team management privileges or school assignment' })
    }

    let team = await prisma.team.findFirst({
      where: {
        schoolId: profile.schoolId,
        coachId: session.user.id
      },
      include: {
        school: true,
        profiles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                verified: true
              }
            }
          }
        },
        stats: {
          where: {
            verified: false
          },
          include: {
            profile: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!team && profile.school) {
      team = await prisma.team.create({
        data: {
          name: `${profile.school.name} Football`,
          sport: 'FOOTBALL',
          season: '2024',
          schoolId: profile.schoolId,
          coachId: session.user.id,
          coachVerified: true
        },
        include: {
          school: true,
          profiles: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  verified: true
                }
              }
            }
          },
          stats: {
            where: {
              verified: false
            },
            include: {
              profile: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
    }

    res.json({
      team,
      privileges: {
        canManageTeam: profile.canManageTeam,
        canVerifyStats: profile.canVerifyStats,
        canCreateAwards: profile.canCreateAwards
      },
      pendingStats: team?.stats.length || 0
    })

  } catch (error) {
    console.error('Error fetching coach team:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

async function updateMyTeam(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res, ['COACH'])
  if (!session) return

  try {
    const { action, targetUserId, athleteEmail } = req.body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profiles: true }
    })

    const profile = user?.profiles[0]
    if (!user?.verified || !profile?.canManageTeam) {
      return res.status(403).json({ message: 'Insufficient team management privileges' })
    }

    const team = await prisma.team.findFirst({
      where: {
        schoolId: profile.schoolId || '',
        coachId: session.user.id
      }
    })

    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    if (action === 'add_athlete') {
      const athlete = await prisma.user.findUnique({
        where: { email: athleteEmail },
        include: { profiles: true }
      })

      if (!athlete || athlete.role !== 'ATHLETE') {
        return res.status(404).json({ message: 'Athlete not found' })
      }

      await prisma.profile.updateMany({
        where: { userId: athlete.id },
        data: {
          teamId: team.id,
          schoolId: profile.schoolId
        }
      })

      res.json({ message: 'Athlete added to team successfully' })

    } else if (action === 'remove_athlete') {
      await prisma.profile.updateMany({
        where: {
          userId: targetUserId,
          teamId: team.id
        },
        data: {
          teamId: null
        }
      })

      res.json({ message: 'Athlete removed from team successfully' })

    } else {
      res.status(400).json({ message: 'Invalid action' })
    }

  } catch (error) {
    console.error('Error updating team:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// File 2: pages/api/teams/verify-stat.ts (FIXED VERSION)

import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['COACH'])
  if (!session) return

  try {
    const { statId, verified, verificationNote } = req.body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profiles: true }
    })

    const profile = user?.profiles[0]
    if (!user?.verified || !profile?.canVerifyStats) {
      return res.status(403).json({ message: 'Insufficient stat verification privileges' })
    }

    const stat = await prisma.stat.findUnique({
      where: { id: statId },
      include: {
        profile: {
          include: {
            team: true
          }
        }
      }
    })

    if (!stat) {
      return res.status(404).json({ message: 'Stat not found' })
    }

    if (stat.profile.team?.coachId !== session.user.id) {
      return res.status(403).json({ message: 'Can only verify stats for your team athletes' })
    }

    const updatedStat = await prisma.stat.update({
      where: { id: statId },
      data: {
        verified: verified,
        verifiedAt: verified ? new Date() : null,
        verifiedById: verified ? session.user.id : null,
        verificationNote: verificationNote || null
      },
      include: {
        profile: true,
        verifiedBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (verified) {
      await prisma.tokenTransaction.create({
        data: {
          userId: stat.profile.userId,
          type: 'EARNED',
          amount: 5,
          balance: 0,
          source: 'STAT_VERIFICATION',
          sourceId: statId,
          description: 'Stat verified by coach'
        }
      })

      await prisma.user.update({
        where: { id: stat.profile.userId },
        data: {
          tokenBalance: {
            increment: 5
          }
        }
      })
    }

    res.json({
      message: `Stat ${verified ? 'verified' : 'rejected'} successfully`,
      stat: updatedStat,
      tokensAwarded: verified ? 5 : 0
    })

  } catch (error) {
    console.error('Error verifying stat:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}