import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import prisma from '../../../lib/prisma'
import { awardTokens } from '../../../lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    const body = JSON.stringify(req.body)
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send('Webhook signature verification failed')
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.client_reference_id
    const metadata = session.metadata

    if (!userId || !metadata) {
      console.error('Missing user ID or metadata in checkout session')
      return
    }

    const tokenAmount = parseInt(metadata.tokenAmount)
    const packageType = metadata.packageType
    const originalPrice = parseInt(metadata.originalPrice)
    const discount = parseFloat(metadata.discount)

    // Award tokens to user
    const result = await awardTokens(
      userId,
      tokenAmount,
      'PURCHASE',
      session.id,
      `Purchased ${packageType} package - ${tokenAmount} tokens`
    )

    if (!result.success) {
      console.error('Failed to award tokens:', result.error)
      return
    }

    // Create detailed transaction record
    await prisma.tokenTransaction.create({
      data: {
        userId,
        type: 'PURCHASED',
        amount: tokenAmount,
        balance: result.newBalance,
        source: 'STRIPE_PURCHASE',
        sourceId: session.id,
        description: `Token purchase: ${packageType} package`,
        stripePaymentId: session.payment_intent as string
      }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TOKEN_PURCHASE_COMPLETED',
        resource: 'token_transactions',
        resourceId: session.id,
        newData: JSON.stringify({
          packageType,
          tokensAwarded: tokenAmount,
          newBalance: result.newBalance,
          originalPrice,
          discount,
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent
        })
      }
    })

    console.log(`Successfully processed token purchase for user ${userId}: ${tokenAmount} tokens`)

  } catch (error) {
    console.error('Error processing checkout completion:', error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Additional verification that payment was processed
    console.log(`Payment succeeded: ${paymentIntent.id}`)
    
    // Update any pending token transactions
    await prisma.tokenTransaction.updateMany({
      where: {
        stripePaymentId: paymentIntent.id,
        type: 'PURCHASED'
      },
      data: {
        description: 'Token purchase completed successfully'
      }
    })

  } catch (error) {
    console.error('Error processing payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment failed: ${paymentIntent.id}`)
    
    // Log failed payment for audit
    await prisma.auditLog.create({
      data: {
        action: 'TOKEN_PURCHASE_FAILED',
        resource: 'token_transactions',
        resourceId: paymentIntent.id,
        newData: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          failureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
        })
      }
    })

  } catch (error) {
    console.error('Error processing payment failure:', error)
  }
}

// Disable body parsing for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}