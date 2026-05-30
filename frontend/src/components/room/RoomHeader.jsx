import { useState, useEffect } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { storage } from '../../lib/token.js';

function formatCountdown(ms) {
  if (ms <= 0) return '0:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function RoomHeader({ room, onlineCount, isExpiring, roomId, onToggleUsers }) {
  const { t } = useLang();
  const [timeLeft, setTimeLeft] = useState(room ? room.expiresAt - Date.now() : 0);
  const ownerToken = storage.getOwnerToken(roomId);

  useEffect(() => {
    if (!room) return;
    const interval = setInterval(() => {
      setTimeLeft(room.expiresAt - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [room]);

  if (!room) return null;

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <h1 className="font-semibold text-zinc-100 truncate">{room.name}</h1>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isExpiring && (
          <span className="text-xs text-amber-400 animate-pulse hidden sm:inline">{t('expiringWarning')}</span>
        )}
        <div className={`font-mono text-sm tabular-nums ${timeLeft < 600000 ? 'text-amber-400' : 'text-zinc-400'}`}>
          {formatCountdown(timeLeft)}
        </div>
        {ownerToken && (
          <a
            href={`/owner/${roomId}`}
            className="text-xs px-2 py-1 rounded bg-zinc-800 text-emerald-400 hover:bg-zinc-700 transition-colors"
          >
            {t('ownerBadge')}
          </a>
        )}
        {/* Mobile: show user list toggle */}
        <button
          onClick={onToggleUsers}
          className="md:hidden flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded bg-zinc-800"
        >
          👥 {onlineCount}
        </button>
      </div>
    </header>
  );
}
