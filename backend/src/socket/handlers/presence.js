import redis from '../../lib/redis.js';
import { updatePing } from '../../services/presence.service.js';

export function registerPresenceHandlers(io, socket) {
  socket.on('ping', async () => {
    if (!socket.session) return;
    const { roomId, jti } = socket.session;

    await updatePing(roomId, jti);

    const ttl = await redis.ttl(`room:${roomId}`);
    socket.emit('pong', { ttl });

    if (ttl > 0 && ttl <= 600) {
      socket.emit('room:expiring', { ttl });
    }
  });
}
