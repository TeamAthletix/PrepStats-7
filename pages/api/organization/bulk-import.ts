import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['ORGANIZATION'])
  if (!session) return

  try {
    const { athletes } = req.body

    if (!Array.isArray(athletes) || athletes.length === 0) {
      return res.status(400).json({ message: 'Athletes array is required' })
    }

    // Validate organization user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profiles: true }
    })

    if (!user || user.role !== 'ORGANIZATION') {
      return res.status(403).json({ message: 'Organization privileges required' })
    }

    const organizationName = user.profiles[0]?.additionalInfo || 'Unknown Organization'
    const results = {
      created: [],
      errors: [],
      duplicates: []
    }

    // Process each athlete
    for (const athlete of athletes) {
      try {
        const { 
          firstName, 
          lastName, 
          email, 
          gradYear, 
          position, 
          schoolId, 
          schoolName 
        } = athlete

        // Validate required fields
        if (!firstName || !lastName || !email || !gradYear || !schoolId) {
          results.errors.push({
            athlete: `${firstName} ${lastName}`,
            error: 'Missing required fields (firstName, lastName, email, gradYear, schoolId)'
          })
          continue
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        })

        if (existingUser) {
          results.duplicates.push({
            athlete: `${firstName} ${lastName}`,
            email: email,
            message: 'User already exists with this email'
          })
          continue
        }

        // Create placeholder user account
        const newUser = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            password: null, // No password - they'll set it when claiming
            role: 'ATHLETE',
            verified: false,
            verificationStatus: 'placeholder',
            tokenBalance: 10, // Welcome bonus
          }
        })

        // Create profile
        await prisma.profile.create({
          data: {
            userId: newUser.id,
            firstName,
            lastName,
            graduationYear: parseInt(gradYear),
            position: position || null,
            schoolId,
            additionalInfo: organizationName, // Link to organization
            verified: false,
            // Mark as placeholder profile
            verificationStatus: 'placeholder'
          }
        })

        // Create welcome token transaction
        await prisma.tokenTransaction.create({
          data: {
            userId: newUser.id,
            type: 'EARNED',
            amount: 10,
            balance: 10,
            source: 'ORG_IMPORT',
            sourceId: session.user.id,
            description: `Imported by ${organizationName}`
          }
        })

        results.created.push({
          athlete: `${firstName} ${lastName}`,
          email: email,
          school: schoolName,
          gradYear: gradYear
        })

      } catch (error) {
        console.error('Error creating athlete:', error)
        results.errors.push({
          athlete: `${athlete.firstName} ${athlete.lastName}`,
          error: 'Failed to create athlete profile'
        })
      }
    }

    res.status(200).json({
      message: `Bulk import completed: ${results.created.length} created, ${results.duplicates.length} duplicates, ${results.errors.length} errors`,
      results
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}