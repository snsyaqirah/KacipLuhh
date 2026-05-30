import crypto from 'crypto';
import redis from '../lib/redis.js';

export async function createPoll(roomId, { pollId, encryptedContent, optionCount }) {
  const poll = {
    id: pollId,
    encrypted_content: encryptedContent, // question + options encrypted client-side
    option_count: Number(optionCount),
    votes: {}, // { [optionIndex]: [userId, ...] }
    created_at: Date.now(),
  };

  const ttl = await redis.ttl(`room:${roomId}`);
  await redis.hset(`room:${roomId}:polls`, pollId, JSON.stringify(poll));
  if (ttl > 0) await redis.expire(`room:${roomId}:polls`, ttl);

  return poll;
}

export async function votePoll(roomId, pollId, optionIndex, userId) {
  const raw = await redis.hget(`room:${roomId}:polls`, pollId);
  if (!raw) throw Object.assign(new Error('Poll not found'), { status: 404 });

  const poll = JSON.parse(raw);
  const idx = String(optionIndex);

  // Remove existing vote by this user from all options
  for (const key of Object.keys(poll.votes)) {
    poll.votes[key] = poll.votes[key].filter(uid => uid !== userId);
  }

  // Toggle: if already voted this option, just remove (already done above); else add
  if (!poll.votes[idx]) poll.votes[idx] = [];
  const alreadyVoted = Object.entries(poll.votes).some(([k, uids]) => k !== idx && uids.includes(userId));
  poll.votes[idx].push(userId);

  await redis.hset(`room:${roomId}:polls`, pollId, JSON.stringify(poll));
  return poll;
}

export async function getPoll(roomId, pollId) {
  const raw = await redis.hget(`room:${roomId}:polls`, pollId);
  return raw ? JSON.parse(raw) : null;
}

export async function getPolls(roomId) {
  const hash = await redis.hgetall(`room:${roomId}:polls`) || {};
  return Object.values(hash).map(r => JSON.parse(r));
}
