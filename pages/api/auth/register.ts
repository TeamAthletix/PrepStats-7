import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password, role, profileData } = req.body

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        profiles: {
          create: {
            type: role,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            gradYear: profileData.gradYear,
            position: profileData.position,
            school: profileData.school,
            team: profileData.teamId ? {
              connect: { id: profileData.teamId }
            } : undefined
          }
        }
      },
      include: {
        profiles: true
      }
    })

    const { password: _, ...userWithoutPassword } = user
    res.status(201).json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
