import { useState, useEffect } from 'react';
import { getRoom } from '../lib/api.js';

export function useRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    getRoom(roomId)
      .then(setRoom)
      .catch(() => setError('Room not found'))
      .finally(() => setLoading(false));
  }, [roomId]);

  return { room, loading, error, setRoom };
}
