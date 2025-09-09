import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

interface SchoolData {
  name: string
  city: string
  state: string
  classification?: string
  district?: string
  address?: string
  phone?: string
  website?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res, ['ADMIN'])
  if (!session) return

  try {
    const { schools }: { schools: SchoolData[] } = req.body

    if (!schools || !Array.isArray(schools)) {
      return res.status(400).json({ error: 'Schools array is required' })
    }

    if (schools.length === 0) {
      return res.status(400).json({ error: 'At least one school is required' })
    }

    // Validate school data
    const validatedSchools = schools.map((school, index) => {
      if (!school.name || !school.city || !school.state) {
        throw new Error(`School at index ${index} is missing required fields (name, city, state)`)
      }
      
      return {
        name: school.name.trim(),
        city: school.city.trim(),
        state: school.state.trim(),
        classification: school.classification?.trim() || null,
        district: school.district?.trim() || null,
        address: school.address?.trim() || null,
        phone: school.phone?.trim() || null,
        website: school.website?.trim() || null,
        verified: true // Auto-verify bulk imported schools
      }
    })

    // Batch insert schools
    const result = await prisma.school.createMany({
      data: validatedSchools,
      skipDuplicates: true // Skip schools that already exist
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SCHOOLS_BULK_IMPORTED',
        resource: 'schools',
        resourceId: 'bulk_import',
        newData: JSON.stringify({
          schoolsAttempted: schools.length,
          schoolsCreated: result.count,
          timestamp: new Date().toISOString()
        })
      }
    })

    res.status(201).json({
      success: true,
      message: `Successfully imported ${result.count} schools`,
      stats: {
        attempted: schools.length,
        created: result.count,
        skipped: schools.length - result.count
      }
    })

  } catch (error) {
    console.error('Bulk school import error:', error)
    res.status(500).json({ 
      error: 'Failed to import schools',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}