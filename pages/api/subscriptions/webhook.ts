import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import prisma from '../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature'] as string;
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.client_reference_id!);
        const tier = session.metadata?.tier as SubscriptionTier;
        await prisma.subscription.create({
          data: { userId, tier, stripeSubscriptionId: session.subscription as string },
        });
        let tokens = 10;
        if (tier === SubscriptionTier.ELITE) tokens = 20;
        if (tier === SubscriptionTier.ELITE_ANNUAL) tokens = 100;
        await prisma.user.update({ where: { id: userId }, data: { tokensAvailable: { increment: tokens } } });
        await prisma.transactionLog.create({
          data: { userId, action: 'token_grant', details: { tokens, tier } },
        });
      }
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
