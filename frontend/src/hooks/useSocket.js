import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket({ roomId, token, onMessage, onPresence, onHistory, onExpiring, onDeleted, onTyping, onReaction, onPollUpdate }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Ref-based callbacks — always calls the LATEST version, fixing stale closure bug
  const cb = useRef({});
  useEffect(() => {
    cb.current = { onMessage, onPresence, onHistory, onExpiring, onDeleted, onTyping, onReaction, onPollUpdate };
  });

  useEffect(() => {
    if (!roomId || !token) return;

    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token, roomId },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('room:join');
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('message:receive', (d) => cb.current.onMessage?.(d));
    socket.on('message:history', (d) => cb.current.onHistory?.(d));
    socket.on('presence:update', (d) => cb.current.onPresence?.(d));
    socket.on('room:expiring', (d) => cb.current.onExpiring?.(d));
    socket.on('room:deleted', () => cb.current.onDeleted?.());
    socket.on('typing:update', (d) => cb.current.onTyping?.(d));
    socket.on('reaction:update', (d) => cb.current.onReaction?.(d));
    socket.on('poll:update', (d) => cb.current.onPollUpdate?.(d));

    const ping = setInterval(() => {
      if (socket.connected) socket.emit('ping');
    }, 10000);

    return () => {
      clearInterval(ping);
      socket.emit('room:leave');
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [roomId, token]);

  const sendMessage = useCallback((content, replyTo) => {
    socketRef.current?.emit('message:send', { content, replyTo });
  }, []);

  const requestHistory = useCallback(() => {
    socketRef.current?.emit('message:history');
  }, []);

  const emitTyping = useCallback((isTyping) => {
    socketRef.current?.emit(isTyping ? 'typing:start' : 'typing:stop');
  }, []);

  const addReaction = useCallback((msgId, emoji) => {
    socketRef.current?.emit('reaction:toggle', { msgId, emoji });
  }, []);

  const votePoll = useCallback((pollId, optionId) => {
    socketRef.current?.emit('poll:vote', { pollId, optionId });
  }, []);

  const createPoll = useCallback((encryptedContent, pollId, optionCount) => {
    socketRef.current?.emit('poll:create', { encryptedContent, pollId, optionCount });
  }, []);

  return { connected, sendMessage, requestHistory, emitTyping, addReaction, votePoll, createPoll };
}
