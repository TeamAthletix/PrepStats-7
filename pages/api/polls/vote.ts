import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { deductTokens } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, pollId, nomineeId, tokenCount = 1 } = req.body;
    const existingVotes = await prisma.vote.count({ where: { userId, pollId } });
    let effectiveCount = tokenCount;
    if (existingVotes === 0 && tokenCount >= 1) {
      effectiveCount -= 1;
    }
    if (effectiveCount > 0 && !(await deductTokens(userId, effectiveCount))) {
      return res.status(403).json({ error: 'Insufficient tokens' });
    }
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll || new Date() > poll.expiration) {
      return res.status(400).json({ error: 'Poll expired or invalid' });
    }
    try {
      const vote = await prisma.vote.create({
        data: { pollId, userId, nomineeId, tokenCount },
      });
      await prisma.transactionLog.create({
        data: { userId, action: 'poll_vote', details: { pollId, nomineeId, tokens: effectiveCount } },
      });
      console.log('Beacon: poll_vote');
      res.status(201).json(vote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to cast vote' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
