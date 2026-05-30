import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket({ roomId, token, onMessage, onPresence, onHistory, onExpiring, onDeleted }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

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
      socket.emit('message:history');
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('message:receive', onMessage);
    socket.on('message:history', onHistory);
    socket.on('presence:update', onPresence);
    socket.on('room:expiring', onExpiring);
    socket.on('room:deleted', onDeleted);

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

  const sendMessage = useCallback((content) => {
    socketRef.current?.emit('message:send', { content });
  }, []);

  return { connected, sendMessage };
}
