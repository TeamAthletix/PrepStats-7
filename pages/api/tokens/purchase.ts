import { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// Token packages available for purchase
const TOKEN_PACKAGES = {
  small: { tokens: 25, price: 499, name: 'Small Pack' },      // $4.99
  medium: { tokens: 60, price: 999, name: 'Medium Pack' },    // $9.99  
  large: { tokens: 150, price: 1999, name: 'Large Pack' },    // $19.99
  mega: { tokens: 350, price: 3999, name: 'Mega Pack' }       // $39.99
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { packageType, successUrl, cancelUrl } = req.body

    if (!packageType || !TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES]) {
      return res.status(400).json({ error: 'Invalid package type' })
    }

    const tokenPackage = TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES]

    // Apply subscription tier discounts
    const discount = getSubscriptionDiscount(session.user.subscriptionTier)
    const finalPrice = Math.round(tokenPackage.price * (1 - discount))

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        packageType,
        tokenAmount: tokenPackage.tokens.toString(),
        originalPrice: tokenPackage.price.toString(),
        discount: discount.toString()
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tokenPackage.name} - ${tokenPackage.tokens} Tokens`,
              description: discount > 0 
                ? `${Math.round(discount * 100)}% subscription discount applied`
                : 'Premium tokens for PrepStats platform'
            },
            unit_amount: finalPrice
          },
          quantity: 1
        }
      ],
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/tokens/purchase?payment=cancelled`
    })

    // Log the purchase attempt
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOKEN_PURCHASE_INITIATED',
        resource: 'token_transactions',
        resourceId: checkoutSession.id,
        newData: JSON.stringify({
          packageType,
          tokens: tokenPackage.tokens,
          price: finalPrice,
          discount,
          stripeSessionId: checkoutSession.id
        })
      }
    })

    res.status(200).json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      package: {
        ...tokenPackage,
        finalPrice,
        discount,
        originalPrice: tokenPackage.price
      }
    })

  } catch (error) {
    console.error('Token purchase error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}

function getSubscriptionDiscount(tier: string): number {
  const discounts = {
    FREE: 0,
    STARTER: 0.05,  // 5% discount
    PRO: 0.10,      // 10% discount
    ELITE: 0.15     // 15% discount
  }
  return discounts[tier as keyof typeof discounts] || 0
}