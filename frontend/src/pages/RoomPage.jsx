import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useCrypto } from '../hooks/useCrypto.js';
import { useSocket } from '../hooks/useSocket.js';
import { usePresence } from '../hooks/usePresence.js';
import { useRoom } from '../hooks/useRoom.js';
import { RoomHeader } from '../components/room/RoomHeader.jsx';
import { UserList } from '../components/room/UserList.jsx';
import { ChatWindow } from '../components/chat/ChatWindow.jsx';
import { MessageInput } from '../components/chat/MessageInput.jsx';
import { Button } from '../components/ui/Button.jsx';
import { storage } from '../lib/token.js';
import { reportRoom } from '../lib/api.js';

export function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const token = storage.getToken(roomId);
  const myNickname = storage.getNickname(roomId);

  const { room, error: roomError, setRoom } = useRoom(roomId);
  const { keyReady, encrypt, decrypt } = useCrypto(roomId);
  const { users, onPresenceUpdate } = usePresence();

  const [messages, setMessages] = useState([]);
  const [isExpiring, setIsExpiring] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const onMessage = useCallback(async (msg) => {
    try {
      const text = await decrypt(msg.content);
      setMessages(prev => [...prev, { ...msg, text }]);
    } catch {
    }
  }, [decrypt]);

  const onHistory = useCallback(async (msgs) => {
    const decoded = await Promise.all(
      msgs.map(async (m) => {
        try {
          const text = await decrypt(m.encrypted_content);
          return { id: m.id, sender: '?', text, timestamp: m.timestamp };
        } catch {
          return null;
        }
      })
    );
    setMessages(decoded.filter(Boolean));
  }, [decrypt]);

  const onExpiring = useCallback(({ ttl }) => {
    setIsExpiring(true);
    setRoom(r => r ? { ...r, expiresAt: Date.now() + ttl * 1000 } : r);
  }, [setRoom]);

  const onDeleted = useCallback(() => {
    storage.clearRoom(roomId);
    setIsDead(true);
  }, [roomId]);

  const { connected, sendMessage } = useSocket({
    roomId,
    token,
    onMessage,
    onPresence: onPresenceUpdate,
    onHistory,
    onExpiring,
    onDeleted,
  });

  async function handleSend(text) {
    if (!keyReady) return;
    try {
      const encrypted = await encrypt(text);
      sendMessage(encrypted);
    } catch {
    }
  }

  function handleLeave() {
    storage.clearRoom(roomId);
    navigate('/');
  }

  async function handleReport(e) {
    e.preventDefault();
    await reportRoom(roomId, reportReason);
    setReportSent(true);
    setTimeout(() => setShowReport(false), 2000);
  }

  useEffect(() => {
    if (!token || !myNickname) navigate(`/join/${roomId}`);
  }, [token, myNickname, roomId, navigate]);

  if (isDead) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl text-zinc-100">{t('roomExpired')}</p>
          <Button onClick={() => navigate('/')} variant="secondary">← {t('createRoom')}</Button>
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">{t('roomNotFound')}</p>
          <Button onClick={() => navigate('/')} variant="secondary">← {t('createRoom')}</Button>
        </div>
      </div>
    );
  }

  const onlineCount = users.filter(u => u.status === 'online').length;

  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      <RoomHeader
        room={room}
        onlineCount={onlineCount}
        isExpiring={isExpiring}
        roomId={roomId}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-zinc-800">
            <button
              onClick={() => setShowReport(true)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {t('reportRoom')}
            </button>
            <button
              onClick={handleLeave}
              className="text-xs text-red-600 hover:text-red-400 transition-colors"
            >
              {t('leaveRoom')}
            </button>
          </div>

          <ChatWindow messages={messages} myNickname={myNickname} />
          <MessageInput onSend={handleSend} disabled={!connected || !keyReady} />
        </main>

        <UserList users={users} myNickname={myNickname} />
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm space-y-4 border border-zinc-800">
            <h3 className="font-semibold text-zinc-100">{t('reportTitle')}</h3>
            {reportSent ? (
              <p className="text-sm text-emerald-400">{t('reportSuccess')}</p>
            ) : (
              <form onSubmit={handleReport} className="space-y-3">
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder={t('reportReasonPlaceholder')}
                  maxLength={500}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowReport(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="secondary" size="sm">
                    {t('reportSubmit')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
