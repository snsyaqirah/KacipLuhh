import crypto from 'crypto';
import redis from '../lib/redis.js';
import { closeRoom, getRoom } from '../services/room.service.js';

export async function handleGetReports(req, res, next) {
  try {
    const keys = await redis.keys('report:*');
    if (!keys.length) return res.json({ reports: [] });
    const values = await Promise.all(keys.map(k => redis.get(k)));
    const reports = values.filter(Boolean).map(v => JSON.parse(v));
    reports.sort((a, b) => b.timestamp - a.timestamp);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
}

export async function handleAdminClose(req, res, next) {
  try {
    const room = await getRoom(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    await closeRoom(req.params.id);
    console.log(`[admin] closed room ${req.params.id}`);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function handleReport(req, res, next) {
  try {
    const roomId = req.params.id;
    const reason = String(req.body?.reason ?? '').slice(0, 500);

    const report = {
      id: crypto.randomUUID(),
      roomId,
      reason,
      timestamp: Date.now(),
    };

    await redis.setex(`report:${report.id}`, 7 * 24 * 3600, JSON.stringify(report));

    if (process.env.NOTIFY_WEBHOOK_URL) {
      fetch(process.env.NOTIFY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `⚠️ Room reported\nRoom ID: ${roomId}\nReason: ${reason || '(none)'}`,
        }),
      }).catch(() => {});
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
