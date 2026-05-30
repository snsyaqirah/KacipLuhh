import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { joinRoom, getRoom } from '../lib/api.js';
import { storage } from '../lib/token.js';
import { importRoomKey } from '../lib/crypto.js';

export function JoinPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [nickname, setNickname] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [roomDead, setRoomDead] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    // check room status first
    getRoom(roomId).then(r => {
      if (!r || r.status !== 'active') setRoomDead(true);
      else setRoomInfo(r);
    }).catch(() => setRoomDead(true));

    const hash = window.location.hash;
    if (hash.startsWith('#k=')) {
      const raw = hash.slice(3);
      history.replaceState(null, '', window.location.pathname);
      storage.setKey(roomId, raw);
      importRoomKey(raw).then(() => setHasKey(true)).catch(() => setHasKey(false));
      return;
    }
    setHasKey(!!storage.getKey(roomId));
  }, [roomId]);

  async function handleJoin(e) {
    e.preventDefault();
    if (!nickname.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { memberToken, room } = await joinRoom(roomId, nickname.trim(), passcode || undefined);
      storage.setToken(roomId, memberToken);
      storage.setNickname(roomId, nickname.trim());
      navigate(`/${room.slug}/${roomId}`);
    } catch (err) {
      const msg = err?.response?.data?.error;
      if (msg === 'Nickname already taken') setError(t('nicknameTaken'));
      else if (msg === 'Room not found') setError(t('roomNotFound'));
      else if (msg === 'Passcode required' || msg === 'Wrong passcode') setError('Wrong passcode. Try again.');
      else setError(msg || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (roomDead) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">✌️</p>
          <p className="text-lg font-semibold text-zinc-100">{t('roomExpired')}</p>
          <a href="/" className="text-sm text-emerald-500 hover:underline">← {t('createRoom')}</a>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-zinc-100 font-medium">⚠️ {t('noKey')}</p>
          <a href="/" className="text-sm text-emerald-500 hover:underline">← {t('createRoom')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-zinc-100 font-mono">💬 KacipLuhh</h1>
          <p className="text-sm text-zinc-500">{t('pickNickname')}</p>
        </div>

        <form onSubmit={handleJoin} className="bg-zinc-900 rounded-2xl p-6 space-y-4 border border-zinc-800">
          <Input
            label={t('pickNickname')}
            placeholder={t('nicknamePlaceholder')}
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={30}
            autoFocus
            error={error}
          />
          {roomInfo?.hasPasscode && (
            <Input
              label="🔒 Passcode"
              type="text"
              placeholder="Enter passcode"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              maxLength={32}
            />
          )}
          <Button type="submit" className="w-full" disabled={loading || !nickname.trim()}>
            {loading ? t('joining') : t('joinBtn')}
          </Button>
        </form>
      </div>
    </div>
  );
}
