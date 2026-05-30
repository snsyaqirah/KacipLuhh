import { verifyToken } from '../lib/token.js';

export function requireOwner(req, res, next) {
  const token = req.headers['x-owner-token'] || req.body?.ownerToken;
  if (!token) return res.status(401).json({ error: 'Owner token required' });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'owner' || payload.roomId !== req.params.id) {
    return res.status(403).json({ error: 'Invalid owner token' });
  }

  req.tokenPayload = payload;
  next();
}
