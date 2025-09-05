import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const TOKEN_PACKAGES = {
  small: { tokens: 5, price: 499 },
  medium: { tokens: 15, price: 999 },
  large: { tokens: 35, price: 1999 }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { packageType } = req.body
  const tokenPackage = TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES]

  if (!tokenPackage) {
    return res.status(400).json({ message: 'Invalid package type' })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tokenPackage.price,
      currency: 'usd',
      metadata: {
        userId: session.user.id,
        tokens: tokenPackage.tokens.toString(),
        packageType
      }
    })

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      tokens: tokenPackage.tokens,
      price: tokenPackage.price 
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
