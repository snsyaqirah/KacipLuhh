import { createRoom, getRoom, joinRoom, extendRoom, closeRoom } from '../services/room.service.js';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  duration: z.coerce.number().int().positive(),
});

const joinSchema = z.object({
  nickname: z.string().min(1).max(30),
});

const extendSchema = z.object({
  hours: z.coerce.number().int().positive(),
});

export async function handleCreate(req, res, next) {
  try {
    const { name, duration } = createSchema.parse(req.body);
    const { roomId, slug, ownerToken } = await createRoom({ name, duration });
    res.status(201).json({ roomId, slug, ownerToken });
  } catch (err) {
    next(err);
  }
}

export async function handleGet(req, res, next) {
  try {
    const room = await getRoom(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    next(err);
  }
}

export async function handleJoin(req, res, next) {
  try {
    const { nickname } = joinSchema.parse(req.body);
    const { memberToken, room } = await joinRoom(req.params.id, nickname);
    res.json({ memberToken, room });
  } catch (err) {
    next(err);
  }
}

export async function handleExtend(req, res, next) {
  try {
    const { hours } = extendSchema.parse(req.body);
    const { expiresAt } = await extendRoom(req.params.id, hours);
    res.json({ expiresAt });
  } catch (err) {
    next(err);
  }
}

export async function handleClose(req, res, next) {
  try {
    await closeRoom(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
