import { useState } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { Button } from '../ui/Button.jsx';
import { extendRoom } from '../../lib/api.js';

export function ExpiryExtender({ roomId, ownerToken, onExtended }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  async function handleExtend(hours) {
    setLoading(true);
    try {
      const { expiresAt } = await extendRoom(roomId, hours, ownerToken);
      onExtended(expiresAt);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400">{t('extendRoom')}</p>
      <div className="flex gap-2">
        {[6, 12, 24].map(h => (
          <Button
            key={h}
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => handleExtend(h)}
          >
            {t('extend', h)}
          </Button>
        ))}
      </div>
    </div>
  );
}
