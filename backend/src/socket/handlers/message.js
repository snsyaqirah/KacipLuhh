import crypto from 'crypto';
import { addMessage, getMessages } from '../../services/room.service.js';

const MAX_CONTENT_LENGTH = 5000;

export function registerMessageHandlers(io, socket) {
  socket.on('message:send', async ({ content }) => {
    if (!socket.session) return socket.disconnect();
    if (typeof content !== 'string' || content.length > MAX_CONTENT_LENGTH) return;

    const { roomId, nickname } = socket.session;
    const added = await addMessage(roomId, content);
    if (!added) return;

    io.to(roomId).emit('message:receive', {
      id: crypto.randomUUID(),
      sender: nickname,
      content,
      timestamp: Date.now(),
    });
  });

  socket.on('message:history', async () => {
    if (!socket.session) return;
    const messages = await getMessages(socket.session.roomId);
    socket.emit('message:history', messages);
  });
}
