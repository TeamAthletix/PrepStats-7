import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { deductTokens, generatePoster, getUserTier } from '../../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, playerName, team, position, statLine, theme } = req.body;
    const tier = await getUserTier(userId);
    let cost = 5;
    if (tier === SubscriptionTier.ELITE) cost = 3;
    if (tier === SubscriptionTier.ELITE_ANNUAL) cost = 0;
    if (!(await deductTokens(userId, cost))) {
      return res.status(403).json({ error: 'Insufficient tokens' });
    }
    try {
      const url = await generatePoster({ playerName, team, statLine, theme });
      const poster = await prisma.poster.create({
        data: { id: uuidv4(), userId, playerName, team, position, statLine, theme, url },
      });
      await prisma.transactionLog.create({
        data: { userId, action: 'poster_generated', details: { posterId: poster.id, tokens: cost } },
      });
      console.log('Beacon: poster_generated');
      res.status(201).json(poster);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate poster' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
