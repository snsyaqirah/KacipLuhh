import { verifyToken } from '../lib/token.js';
import { getRoom } from '../services/room.service.js';
import { registerRoomHandlers } from './handlers/room.js';
import { registerMessageHandlers } from './handlers/message.js';
import { registerPresenceHandlers } from './handlers/presence.js';

export function initSocket(io) {
  io.use(async (socket, next) => {
    const { token, roomId } = socket.handshake.auth ?? {};
    if (!token || !roomId) return next(new Error('Unauthorized'));

    const payload = verifyToken(token);
    if (!payload || payload.roomId !== roomId) return next(new Error('Unauthorized'));

    const room = await getRoom(roomId);
    if (!room) return next(new Error('Room not found'));
    if (room.status !== 'active') return next(new Error('Room closed'));

    socket.session = { ...payload, roomId };
    next();
  });

  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerPresenceHandlers(io, socket);
  });
}
