import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      query = '',
      state = 'Alabama',
      classification,
      limit = 20
    } = req.query

    const searchQuery = query.toString().trim().toLowerCase()
    const limitNum = Math.min(parseInt(limit.toString()), 50)

    const where: any = {}

    if (state && state !== 'all') {
      where.state = state.toString()
    }

    if (classification && classification !== 'all') {
      where.classification = classification.toString()
    }

    if (searchQuery) {
      where.OR = [
        {
          name: {
            contains: searchQuery
          }
        },
        {
          city: {
            contains: searchQuery
          }
        }
      ]
    }

    const schools = await prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        classification: true,
        district: true,
        verified: true
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ],
      take: limitNum
    })

    const formattedSchools = schools.map(school => ({
      id: school.id,
      name: school.name,
      city: school.city,
      state: school.state,
      classification: school.classification,
      district: school.district,
      verified: school.verified,
      displayName: `${school.name} - ${school.city}, ${school.state}`,
      label: school.classification 
        ? `${school.name} (${school.classification}) - ${school.city}`
        : `${school.name} - ${school.city}`
    }))

    res.status(200).json({
      schools: formattedSchools,
      total: formattedSchools.length,
      hasMore: formattedSchools.length === limitNum,
      searchQuery,
      filters: {
        state,
        classification
      }
    })

  } catch (error) {
    console.error('School search error:', error)
    res.status(500).json({ error: 'Failed to search schools' })
  }
}