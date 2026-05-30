import crypto from 'crypto';
import { addMessage, getMessages } from '../../services/room.service.js';
import { createPoll, votePoll, getPolls } from '../../services/poll.service.js';

const MAX_CONTENT_LENGTH = 5000;
const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeReplyTo(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || !UUID_RE.test(raw.id)) return null;
  return { id: raw.id }; // strip any extra fields
}

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
      replyTo: safeReplyTo(replyTo),
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
    if (typeof msgId !== 'string' || !UUID_RE.test(msgId)) return;
    if (!ALLOWED_EMOJIS.includes(emoji)) return;
    const { roomId, jti: userId } = socket.session;
    io.to(roomId).emit('reaction:update', { msgId, emoji, userId });
  });

  socket.on('poll:create', async ({ encryptedContent, pollId, optionCount }) => {
    if (!socket.session) return;
    if (!pollId || !encryptedContent || !optionCount) return;
    if (!UUID_RE.test(pollId)) return;
    if (typeof encryptedContent !== 'string' || encryptedContent.length > MAX_CONTENT_LENGTH) return;

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
