import { useState, useEffect, useCallback } from 'react';
import { importRoomKey, encryptMessage, decryptMessage } from '../lib/crypto.js';
import { storage } from '../lib/token.js';

export function useCrypto(roomId) {
  const [cryptoKey, setCryptoKey] = useState(null);
  const [keyReady, setKeyReady] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    async function init() {
      const hash = window.location.hash;
      if (hash.startsWith('#k=')) {
        const raw = hash.slice(3);
        history.replaceState(null, '', window.location.pathname + window.location.search);
        storage.setKey(roomId, raw);
        setCryptoKey(await importRoomKey(raw));
        setKeyReady(true);
        return;
      }

      const stored = storage.getKey(roomId);
      if (stored) {
        setCryptoKey(await importRoomKey(stored));
        setKeyReady(true);
        return;
      }

      setKeyReady(false);
    }

    init().catch(() => setKeyReady(false));
  }, [roomId]);

  const encrypt = useCallback(async (text) => {
    if (!cryptoKey) throw new Error('No encryption key');
    return encryptMessage(text, cryptoKey);
  }, [cryptoKey]);

  const decrypt = useCallback(async (payload) => {
    if (!cryptoKey) throw new Error('No encryption key');
    return decryptMessage(payload, cryptoKey);
  }, [cryptoKey]);

  return { keyReady, encrypt, decrypt };
}
