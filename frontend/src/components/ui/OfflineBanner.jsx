import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-zinc-800 border-b border-zinc-700 py-2.5 text-sm text-zinc-300 animate-in slide-in-from-top">
      <span>📡</span>
      <span>No connection — waiting to reconnect</span>
    </div>
  );
}
