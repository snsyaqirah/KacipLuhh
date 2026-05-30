import crypto from 'crypto';
import { addMessage, getMessages } from '../../services/room.service.js';
import { createPoll, votePoll, getPolls } from '../../services/poll.service.js';

const MAX_CONTENT_LENGTH = 5000;
const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export function registerMessageHandlers(io, socket) {
  socket.on('message:send', async ({ content, replyTo }) => {
    if (!socket.session) return socket.disconnect();
    if (typeof content !== 'string' || content.length > MAX_CONTENT_LENGTH) return;

    const { roomId, nickname } = socket.session;
    const added = await addMessage(roomId, content, nickname);
    if (!added) return;

    io.to(roomId).emit('message:receive', {
      id: crypto.randomUUID(),
      sender: nickname,
      content,
      replyTo: replyTo || null,
      timestamp: Date.now(),
    });
  });

  socket.on('message:history', async () => {
    if (!socket.session) return;
    const { roomId } = socket.session;
    const [messages, polls] = await Promise.all([
      getMessages(roomId),
      getPolls(roomId),
    ]);
    socket.emit('message:history', messages);
    if (polls.length) socket.emit('poll:history', polls);
  });

  socket.on('reaction:toggle', ({ msgId, emoji }) => {
    if (!socket.session) return;
    if (!ALLOWED_EMOJIS.includes(emoji)) return;
    const { roomId, jti: userId } = socket.session;
    io.to(roomId).emit('reaction:update', { msgId, emoji, userId });
  });

  socket.on('poll:create', async ({ encryptedContent, pollId, optionCount }) => {
    if (!socket.session) return;
    if (!pollId || !encryptedContent || !optionCount) return;

    const { roomId, nickname } = socket.session;
    const poll = await createPoll(roomId, { pollId, encryptedContent, optionCount });

    const msgId = crypto.randomUUID();
    await addMessage(roomId, JSON.stringify({ type: 'poll', pollId }), nickname);

    io.to(roomId).emit('message:receive', {
      id: msgId,
      sender: nickname,
      type: 'poll',
      pollId,
      timestamp: Date.now(),
    });
    io.to(roomId).emit('poll:update', poll);
  });

  socket.on('poll:vote', async ({ pollId, optionId }) => {
    if (!socket.session) return;
    const { roomId, jti: userId } = socket.session;
    try {
      const poll = await votePoll(roomId, pollId, optionId, userId);
      io.to(roomId).emit('poll:update', poll);
    } catch {}
  });
}
