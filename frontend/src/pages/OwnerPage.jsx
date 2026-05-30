import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ExpiryExtender } from '../components/room/ExpiryExtender.jsx';
import { useRoom } from '../hooks/useRoom.js';
import { closeRoom } from '../lib/api.js';
import { storage } from '../lib/token.js';

function formatExpiry(ts) {
  return new Date(ts).toLocaleString();
}

export function OwnerPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const [ownerToken, setOwnerToken] = useState('');
  const [closing, setClosing] = useState(false);
  const { room, loading, error, setRoom } = useRoom(roomId);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      storage.setOwnerToken(roomId, tokenFromUrl);
      history.replaceState(null, '', window.location.pathname);
      setOwnerToken(tokenFromUrl);
    } else {
      const stored = storage.getOwnerToken(roomId);
      if (stored) setOwnerToken(stored);
    }
  }, [roomId, searchParams]);

  async function handleClose() {
    if (!window.confirm(t('closeRoomConfirm'))) return;
    setClosing(true);
    try {
      await closeRoom(roomId, ownerToken);
      storage.clearRoom(roomId);
      navigate('/');
    } catch {
    } finally {
      setClosing(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !room) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-zinc-400">{t('roomNotFound')}</p>
        <Button onClick={() => navigate('/')} variant="secondary">← {t('createRoom')}</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{room.name}</h1>
            <p className="text-sm text-zinc-500">{t('ownerBadge')} · {t('timeLeft')}: {formatExpiry(room.expiresAt)}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800">
            {t('ownerBadge')}
          </span>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 space-y-6 border border-zinc-800">
          <ExpiryExtender
            roomId={roomId}
            ownerToken={ownerToken}
            onExtended={(expiresAt) => setRoom(r => ({ ...r, expiresAt }))}
          />

          <hr className="border-zinc-800" />

          <div className="space-y-2">
            <Button
              variant="danger"
              className="w-full"
              disabled={closing}
              onClick={handleClose}
            >
              {closing ? '...' : t('closeRoom')}
            </Button>
            <p className="text-xs text-zinc-600 text-center">
              This immediately deletes all messages for everyone.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href={`/join/${roomId}`}
            className="text-sm text-emerald-500 hover:underline"
          >
            ← Back to room
          </a>
        </div>
      </div>
    </div>
  );
}
