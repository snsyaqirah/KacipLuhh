import { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { useInstallPrompt } from '../hooks/useInstallPrompt.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { createRoom as apiCreateRoom } from '../lib/api.js';
import { generateRoomKey } from '../lib/crypto.js';
import { storage } from '../lib/token.js';
import { ACCENT_COLORS, DEFAULT_ACCENT } from '../lib/colors.js';

const DURATIONS = [6, 12, 24, 48];

function CopyField({ label, hint, value, warn }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLang();

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        {hint && <span className={`text-xs ${warn ? 'text-amber-400' : 'text-zinc-500'}`}>{hint}</span>}
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono focus:outline-none truncate"
        />
        <Button variant="secondary" size="sm" onClick={copy}>
          {copied ? t('copied') : t('copy')}
        </Button>
      </div>
    </div>
  );
}

export function HomePage() {
  const { t } = useLang();
  const { canInstall, install } = useInstallPrompt();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(24);
  const [passcode, setPasscode] = useState('');
  const [usePasscode, setUsePasscode] = useState(false);
  const [maxUsers, setMaxUsers] = useState('');
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const rawKey = await generateRoomKey();
      const { roomId, slug, ownerToken } = await apiCreateRoom(
        name.trim(), duration,
        usePasscode && passcode ? passcode : undefined,
        maxUsers ? Number(maxUsers) : undefined,
        accentColor,
      );

      storage.setKey(roomId, rawKey);
      storage.setOwnerToken(roomId, ownerToken);

      const origin = window.location.origin;
      const shareLink = `${origin}/join/${roomId}#k=${rawKey}`;
      const ownerLink = `${origin}/owner/${roomId}?token=${ownerToken}`;

      setResult({ roomId, slug, shareLink, ownerLink });
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-zinc-100 font-mono">💬 KacipLuhh</h1>
          <p className="text-sm text-zinc-500">{t('tagline')}</p>
        </div>

        {!result ? (
          <form onSubmit={handleCreate} className="bg-zinc-900 rounded-2xl p-6 space-y-5 border border-zinc-800">
            <Input
              label={t('roomName')}
              placeholder={t('roomNamePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
              required
              error={error}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">{t('duration')}</label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${duration === d ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                  >
                    {d}{t('hours')}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Warna bilik</label>
              <div className="flex gap-2">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAccentColor(c.id)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full transition-all ${accentColor === c.id ? 'ring-2 ring-offset-2 ring-offset-zinc-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    style={{ background: c.hex, '--tw-ring-color': c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Optional passcode */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePasscode}
                  onChange={e => setUsePasscode(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="text-sm text-zinc-300">🔒 Passcode (optional)</span>
              </label>
              {usePasscode && (
                <input
                  type="text"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Set a passcode"
                  maxLength={32}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Max users */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-zinc-300">👥 Max users (optional)</span>
              </label>
              <input
                type="number"
                min="2" max="50"
                value={maxUsers}
                onChange={e => setMaxUsers(e.target.value)}
                placeholder="No limit"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <p className="text-xs text-zinc-600 text-center">
              By creating a room, you agree to our{' '}
              <a href="/terms" className="underline hover:text-zinc-400 transition-colors">Terms</a>
              {' '}&amp;{' '}
              <a href="/privacy" className="underline hover:text-zinc-400 transition-colors">Privacy Policy</a>.
            </p>

            <Button type="submit" className="w-full" disabled={loading || !name.trim()}
              style={{ background: ACCENT_COLORS.find(c => c.id === accentColor)?.hex }}>
              {loading ? t('creating') : t('createBtn')}
            </Button>
          </form>
        ) : (
          <div className="bg-zinc-900 rounded-2xl p-6 space-y-5 border border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="font-semibold text-zinc-100">{name}</h2>
            </div>

            <CopyField
              label={t('shareLink')}
              hint={t('shareLinkHint')}
              value={result.shareLink}
            />
            <CopyField
              label={t('ownerLink')}
              hint={t('ownerLinkHint')}
              value={result.ownerLink}
              warn
            />

            <Button
              className="w-full"
              onClick={() => {
                window.location.href = `/join/${result.roomId}#k=${storage.getKey(result.roomId)}`;
              }}
            >
              {t('enterRoom')} →
            </Button>
          </div>
        )}

        <footer className="text-center space-x-4">
          <a href="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400">{t('privacy')}</a>
          <a href="/terms" className="text-xs text-zinc-600 hover:text-zinc-400">{t('terms')}</a>
          {canInstall && (
            <button onClick={install} className="text-xs text-zinc-600 hover:text-zinc-400">
              📲 Install App
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
