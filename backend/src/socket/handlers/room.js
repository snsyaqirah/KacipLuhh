import crypto from 'crypto';
import { markOnline, markOffline, removeUser, getUsers } from '../../services/presence.service.js';
import { pinMessage } from '../../services/room.service.js';

function sysMsg(text, type = 'info') {
  return { id: crypto.randomUUID(), type: 'system', text, sysType: type };
}

export function registerRoomHandlers(io, socket) {
  const { roomId, jti: userId, nickname, role } = socket.session;

  socket.on('room:join', async () => {
    socket.join(roomId);
    await markOnline(roomId, userId, nickname);
    const users = await getUsers(roomId);
    io.to(roomId).emit('presence:update', users);
    socket.to(roomId).emit('system:message', sysMsg(`${nickname} joined`, 'join'));
  });

  socket.on('room:leave', async () => {
    await markOffline(roomId, userId);
    socket.leave(roomId);
    const users = await getUsers(roomId);
    io.to(roomId).emit('presence:update', users);
    socket.to(roomId).emit('system:message', sysMsg(`${nickname} left`, 'leave'));
  });

  socket.on('user:kick', ({ nickname: target }) => {
    if (role !== 'owner') return;
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return;
    for (const sid of room) {
      const s = io.sockets.sockets.get(sid);
      if (s?.session?.nickname === target) {
        s.emit('kicked');
        s.disconnect(true);
        break;
      }
    }
    io.to(roomId).emit('system:message', sysMsg(`${target} was removed by the owner.`, 'kick'));
  });

  socket.on('message:pin', async ({ msgId }) => {
    if (role !== 'owner') return;
    await pinMessage(roomId, msgId || null);
    io.to(roomId).emit('pin:update', { msgId: msgId || null });
  });

  socket.on('disconnect', async () => {
    await markOffline(roomId, userId);
    socket.to(roomId).emit('system:message', sysMsg(`${nickname} left`, 'leave'));
    const users = await getUsers(roomId);
    io.to(roomId).emit('presence:update', users);

    setTimeout(async () => {
      const current = await getUsers(roomId);
      const user = current.find(u => u.id === userId);
      if (user?.status === 'offline') {
        await removeUser(roomId, userId);
        const updated = await getUsers(roomId);
        io.to(roomId).emit('presence:update', updated);
      }
    }, 5 * 60 * 1000);
  });
}
