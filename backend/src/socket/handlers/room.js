import { markOnline, markOffline, removeUser, getUsers } from '../../services/presence.service.js';

export function registerRoomHandlers(io, socket) {
  const { roomId, jti: userId, nickname } = socket.session;

  socket.on('room:join', async () => {
    socket.join(roomId);
    await markOnline(roomId, userId, nickname);
    const users = await getUsers(roomId);
    io.to(roomId).emit('presence:update', users);
  });

  socket.on('room:leave', async () => {
    await markOffline(roomId, userId);
    socket.leave(roomId);
    const users = await getUsers(roomId);
    io.to(roomId).emit('presence:update', users);
  });

  socket.on('disconnect', async () => {
    await markOffline(roomId, userId);
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
