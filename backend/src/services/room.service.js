import crypto from 'crypto';
import redis from '../lib/redis.js';
import { generateToken } from '../lib/token.js';

const MAX_DURATION = parseInt(process.env.MAX_ROOM_DURATION_HOURS ?? '48');
const MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES_PER_ROOM ?? '500');
const VALID_DURATIONS = [6, 12, 24, 48];

function sanitize(str) {
  return String(str).replace(/[<>"'&]/g, '').trim().slice(0, 100);
}

function appError(msg, status) {
  return Object.assign(new Error(msg), { status });
}

function hashPasscode(raw) {
  return crypto.createHash('sha256').update(raw + (process.env.TOKEN_SECRET ?? '')).digest('hex');
}

export async function createRoom({ name, duration, passcode }) {
  const dur = Number(duration);
  if (!VALID_DURATIONS.includes(dur)) throw appError('Invalid duration', 400);
  if (dur > MAX_DURATION) throw appError('Duration exceeds limit', 400);

  const cleanName = sanitize(name);
  if (!cleanName) throw appError('Room name required', 400);

  const roomId = crypto.randomUUID();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'room';
  const ttl = dur * 3600;
  const now = Date.now();

  const ownerToken = generateToken({ roomId, role: 'owner' });

  const fields = {
    id: roomId,
    slug,
    name: cleanName,
    expires_at: now + ttl * 1000,
    created_at: now,
    status: 'active',
    duration_hours: dur,
  };
  if (passcode) fields.passcode_hash = hashPasscode(String(passcode).slice(0, 32));

  await redis.hset(`room:${roomId}`, fields);
  await redis.expire(`room:${roomId}`, ttl);

  return { roomId, slug, ownerToken };
}

export async function getRoom(roomId) {
  const r = await redis.hgetall(`room:${roomId}`);
  if (!r?.id) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    expiresAt: Number(r.expires_at),
    createdAt: Number(r.created_at),
    status: r.status,
    hasPasscode: !!r.passcode_hash,
  };
}

export async function joinRoom(roomId, nickname, passcode) {
  const room = await getRoom(roomId);
  if (!room) throw appError('Room not found', 404);
  if (room.status !== 'active') throw appError('Room is closed', 410);

  const storedHash = await redis.hget(`room:${roomId}`, 'passcode_hash');
  if (storedHash) {
    if (!passcode) throw appError('Passcode required', 401);
    if (hashPasscode(String(passcode)) !== storedHash) throw appError('Wrong passcode', 403);
  }

  const cleanNick = sanitize(nickname);
  if (!cleanNick) throw appError('Nickname required', 400);
  if (cleanNick.length < 1 || cleanNick.length > 30) throw appError('Nickname must be 1–30 characters', 400);

  const existing = await redis.hgetall(`room:${roomId}:users`);
  const taken = Object.values(existing || {}).some(v => {
    try { return JSON.parse(v).nickname === cleanNick; } catch { return false; }
  });
  if (taken) throw appError('Nickname already taken', 409);

  const memberToken = generateToken({ roomId, role: 'member', nickname: cleanNick });
  return { memberToken, room };
}

export async function extendRoom(roomId, hours) {
  const room = await getRoom(roomId);
  if (!room) throw appError('Room not found', 404);
  if (room.status !== 'active') throw appError('Room is closed', 410);

  const addHours = Number(hours);
  if (![6, 12, 24].includes(addHours)) throw appError('Invalid extension', 400);

  const currentTtl = await redis.ttl(`room:${roomId}`);
  if (currentTtl <= 0) throw appError('Room has expired', 410);

  const newTtl = Math.min(currentTtl + addHours * 3600, MAX_DURATION * 3600);
  const newExpiresAt = Date.now() + newTtl * 1000;

  await Promise.all([
    redis.expire(`room:${roomId}`, newTtl),
    redis.expire(`room:${roomId}:messages`, newTtl),
    redis.expire(`room:${roomId}:users`, newTtl),
    redis.hset(`room:${roomId}`, 'expires_at', newExpiresAt),
  ]);

  return { expiresAt: newExpiresAt };
}

export async function closeRoom(roomId) {
  const room = await getRoom(roomId);
  if (!room) throw appError('Room not found', 404);

  await redis.hset(`room:${roomId}`, 'status', 'closed');
  await Promise.all([
    redis.expire(`room:${roomId}`, 60),
    redis.expire(`room:${roomId}:messages`, 60),
    redis.expire(`room:${roomId}:users`, 60),
  ]);
}

export async function addMessage(roomId, encryptedContent, sender) {
  const count = await redis.llen(`room:${roomId}:messages`);
  if (count >= MAX_MESSAGES) return false;

  const msg = JSON.stringify({
    id: crypto.randomUUID(),
    encrypted_content: encryptedContent,
    sender,
    timestamp: Date.now(),
  });

  const roomTtl = await redis.ttl(`room:${roomId}`);
  await redis.rpush(`room:${roomId}:messages`, msg);
  if (roomTtl > 0) await redis.expire(`room:${roomId}:messages`, roomTtl);

  return true;
}

export async function getMessages(roomId) {
  const raw = await redis.lrange(`room:${roomId}:messages`, 0, -1);
  return raw.map(r => JSON.parse(r));
}
