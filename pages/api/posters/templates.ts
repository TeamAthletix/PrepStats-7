import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthSession } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      tier,
      sport,
      userTier
    } = req.query

    const session = await getAuthSession(req, res)

    // Build filter conditions
    const where: any = {
      active: true
    }

    if (sport && sport !== 'all') {
      where.OR = [
        { sport: sport.toString().toUpperCase() },
        { sport: null } // Generic templates
      ]
    }

    if (tier && tier !== 'all') {
      where.tier = tier.toString().toUpperCase()
    }

    // Get templates
    const templates = await prisma.posterTemplate.findMany({
      where,
      orderBy: [
        { tier: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform response with access information
    const transformedTemplates = templates.map(template => {
      const userSubscriptionTier = session?.user?.subscriptionTier || userTier || 'FREE'
      const canAccess = canAccessTemplate(userSubscriptionTier, template.tier)
      
      // Calculate pricing
      const baseCost = getBaseCost(template.tier)
      const discount = getDiscount(userSubscriptionTier)
      const finalCost = Math.max(1, Math.floor(baseCost * (1 - discount)))

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        tier: template.tier,
        sport: template.sport,
        canAccess,
        pricing: {
          baseCost,
          discount: Math.round(discount * 100),
          finalCost,
          requiresUpgrade: !canAccess
        },
        preview: {
          // In real implementation, these would be actual preview images
          thumbnailUrl: `https://api.placeholder.com/300x400/b3a369/ffffff?text=${encodeURIComponent(template.name)}`,
          features: getTemplateFeatures(template.tier)
        },
        metadata: template.templateData ? JSON.parse(template.templateData) : null
      }
    })

    // Group by tier for easier frontend handling
    const groupedTemplates = {
      FREE: transformedTemplates.filter(t => t.tier === 'FREE'),
      STARTER: transformedTemplates.filter(t => t.tier === 'STARTER'),
      PRO: transformedTemplates.filter(t => t.tier === 'PRO'),
      ELITE: transformedTemplates.filter(t => t.tier === 'ELITE')
    }

    res.status(200).json({
      templates: transformedTemplates,
      groupedTemplates,
      userAccess: {
        currentTier: session?.user?.subscriptionTier || 'FREE',
        availableTemplates: transformedTemplates.filter(t => t.canAccess).length,
        totalTemplates: transformedTemplates.length
      },
      pricingInfo: {
        tiers: {
          FREE: { discount: 0, description: 'No discount' },
          STARTER: { discount: 10, description: '10% off all posters' },
          PRO: { discount: 20, description: '20% off all posters' },
          ELITE: { discount: 35, description: '35% off all posters' }
        }
      }
    })

  } catch (error) {
    console.error('Template listing error:', error)
    res.status(500).json({ error: 'Failed to fetch poster templates' })
  }
}

function canAccessTemplate(userTier: string, requiredTier: string): boolean {
  const tierLevels = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    ELITE: 3
  }

  const userLevel = tierLevels[userTier as keyof typeof tierLevels] || 0
  const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0

  return userLevel >= requiredLevel
}

function getBaseCost(tier: string): number {
  const costs = {
    FREE: 5,
    STARTER: 10,
    PRO: 20,
    ELITE: 35
  }
  return costs[tier as keyof typeof costs] || costs.FREE
}

function getDiscount(userTier: string): number {
  const discounts = {
    FREE: 0,
    STARTER: 0.10,
    PRO: 0.20,
    ELITE: 0.35
  }
  return discounts[userTier as keyof typeof discounts] || 0
}

function getTemplateFeatures(tier: string): string[] {
  const features = {
    FREE: [
      'Basic player info',
      'School logo',
      'Simple design'
    ],
    STARTER: [
      'Player stats',
      'School colors',
      'Multiple layouts',
      'Basic customization'
    ],
    PRO: [
      'Advanced stats',
      'Custom backgrounds',
      'Multiple poses',
      'Professional fonts',
      'Social media optimization'
    ],
    ELITE: [
      'Premium animations',
      'Custom graphics',
      'Advanced stats visualization',
      'Multiple formats',
      'Priority generation',
      'Watermark removal'
    ]
  }
  
  return features[tier as keyof typeof features] || features.FREE
}