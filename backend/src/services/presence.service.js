import redis from '../lib/redis.js';

export async function markOnline(roomId, userId, nickname) {
  await redis.hset(`room:${roomId}:users`, userId,
    JSON.stringify({ nickname, status: 'online', lastPing: Date.now() }));
}

export async function markOffline(roomId, userId) {
  const raw = await redis.hget(`room:${roomId}:users`, userId);
  if (!raw) return;
  const user = JSON.parse(raw);
  await redis.hset(`room:${roomId}:users`, userId,
    JSON.stringify({ ...user, status: 'offline', lastPing: Date.now() }));
}

export async function removeUser(roomId, userId) {
  await redis.hdel(`room:${roomId}:users`, userId);
}

export async function getUsers(roomId) {
  const hash = await redis.hgetall(`room:${roomId}:users`) || {};
  return Object.entries(hash).map(([id, raw]) => ({ id, ...JSON.parse(raw) }));
}

export async function updatePing(roomId, userId) {
  const raw = await redis.hget(`room:${roomId}:users`, userId);
  if (!raw) return;
  const user = JSON.parse(raw);
  await redis.hset(`room:${roomId}:users`, userId,
    JSON.stringify({ ...user, status: 'online', lastPing: Date.now() }));
}
