import { useState, useCallback, useEffect, useRef } from 'react';
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
import { CreatePollModal } from '../components/chat/CreatePollModal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { storage } from '../lib/token.js';
import { reportRoom, closeRoom } from '../lib/api.js';
import { encryptMessage, importRoomKey } from '../lib/crypto.js';
import { sound } from '../lib/sound.js';
import { getAccentHex } from '../lib/colors.js';

// ─── Modals ───────────────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50"
      onClick={onClose}>
      <div className="bg-zinc-900 rounded-2xl w-full max-w-sm border border-zinc-800 overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, variant = 'secondary', loading, onConfirm, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-400">{message}</p>
      </div>
      <div className="flex border-t border-zinc-800">
        <button onClick={onClose} className="flex-1 py-3 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors">Batal</button>
        <button onClick={onConfirm} disabled={loading}
          className={`flex-1 py-3 text-sm font-medium border-l border-zinc-800 transition-colors disabled:opacity-50
            ${variant === 'danger' ? 'text-red-400 hover:bg-red-950' : 'text-zinc-100 hover:bg-zinc-800'}`}>
          {loading ? '...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function ReportModal({ roomId, onClose, t }) {
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try { await reportRoom(roomId, reason); setSent(true); setTimeout(onClose, 2000); }
    finally { setLoading(false); }
  }
  return (
    <Modal onClose={onClose}>
      <div className="p-5 space-y-4">
        <h3 className="font-semibold text-zinc-100">{t('reportTitle')}</h3>
        {sent ? <p className="text-sm text-emerald-400 py-2">{t('reportSuccess')}</p> : (
          <form onSubmit={submit} className="space-y-3">
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder={t('reportReasonPlaceholder')} maxLength={500} rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={onClose} className="text-sm text-zinc-400 px-3 py-1.5 hover:text-zinc-200">Batal</button>
              <button type="submit" disabled={loading}
                className="text-sm font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {loading ? '...' : t('reportSubmit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

function DeadRoom({ navigate, t, reason }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="text-5xl">{reason === 'kicked' ? '🚫' : '✌️'}</p>
        <p className="text-xl font-semibold text-zinc-100">
          {reason === 'kicked' ? 'You were removed by the owner.' : t('roomExpired')}
        </p>
        <p className="text-sm text-zinc-500">
          {reason === 'kicked' ? 'Contact the room owner if you think this was a mistake.' : 'Semua mesej dah hilang.'}
        </p>
        <Button onClick={() => navigate('/')} variant="secondary">{t('createRoom')}</Button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const token = storage.getToken(roomId);
  const myNickname = storage.getNickname(roomId);
  const ownerToken = storage.getOwnerToken(roomId);
  const isOwner = !!ownerToken;

  const { room, error: roomError, setRoom } = useRoom(roomId);
  const { keyReady, encrypt, decrypt } = useCrypto(roomId);
  const { users, onPresenceUpdate } = usePresence();

  const accentHex = getAccentHex(room?.accentColor);

  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [reactions, setReactions] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [pinnedMsgId, setPinnedMsgId] = useState(null);
  const [isExpiring, setIsExpiring] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [deadReason, setDeadReason] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const [modal, setModal] = useState(null);
  const [closing, setClosing] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.isEnabled());
  const [unreadCount, setUnreadCount] = useState(0);

  const cryptoKeyRef = useRef(null);

  useEffect(() => {
    if (keyReady) {
      const raw = storage.getKey(roomId);
      if (raw) importRoomKey(raw).then(k => { cryptoKeyRef.current = k; });
    }
  }, [keyReady, roomId]);

  // Sync pinned from room data on load
  useEffect(() => {
    if (room?.pinnedMsgId) setPinnedMsgId(room.pinnedMsgId);
    if (room?.status && room.status !== 'active') setIsDead(true);
  }, [room]);

  // Tab title with unread count
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) KacipLuhh` : 'KacipLuhh';
    return () => { document.title = 'KacipLuhh'; };
  }, [unreadCount]);

  // Reset unread when tab becomes visible
  useEffect(() => {
    function onVisible() { if (!document.hidden) setUnreadCount(0); }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const onMessage = useCallback(async (msg) => {
    if (msg.type === 'poll') { setMessages(prev => [...prev, msg]); return; }
    try {
      const text = await decrypt(msg.content);
      const decoded = { ...msg, text };
      if (msg.replyTo?.id) {
        setMessages(prev => {
          const orig = prev.find(m => m.id === msg.replyTo.id);
          if (orig) decoded.replyTo = { ...msg.replyTo, sender: orig.sender, text: orig.text };
          return [...prev, decoded];
        });
      } else {
        setMessages(prev => [...prev, decoded]);
      }

      if (msg.sender !== myNickname) {
        sound.play();
        if (document.hidden) {
          setUnreadCount(n => n + 1);
          if (Notification.permission === 'granted') {
            const n = new Notification('KacipLuhh 💬', { body: `${msg.sender}: new message`, icon: '/icon.png' });
            n.onclick = () => window.focus();
          }
        }
      }
    } catch {}
  }, [decrypt, myNickname]);

  const onHistory = useCallback(async (msgs) => {
    const decoded = await Promise.all(msgs.map(async (m) => {
      if (m.type === 'poll') return m;
      try {
        const text = await decrypt(m.encrypted_content);
        return { id: m.id, sender: m.sender || '?', text, timestamp: m.timestamp, replyTo: m.replyTo };
      } catch { return null; }
    }));
    setMessages(decoded.filter(Boolean));
  }, [decrypt]);

  const onExpiring = useCallback(({ ttl }) => {
    setIsExpiring(true);
    setRoom(r => r ? { ...r, expiresAt: Date.now() + ttl * 1000 } : r);
  }, [setRoom]);

  const onDeleted = useCallback(() => {
    storage.clearRoom(roomId);
    setDeadReason('expired');
    setIsDead(true);
  }, [roomId]);

  const onKicked = useCallback(() => {
    storage.clearRoom(roomId);
    setDeadReason('kicked');
    setIsDead(true);
  }, [roomId]);

  const onTyping = useCallback(({ userId, nickname, typing }) => {
    setTypingUsers(prev => {
      const next = { ...prev };
      if (typing) next[userId] = nickname; else delete next[userId];
      return next;
    });
  }, []);

  const onReaction = useCallback(({ msgId, emoji, userId }) => {
    setReactions(prev => {
      const msgR = { ...(prev[msgId] || {}) };
      const uids = [...(msgR[emoji] || [])];
      const idx = uids.indexOf(userId);
      if (idx >= 0) uids.splice(idx, 1); else uids.push(userId);
      msgR[emoji] = uids;
      return { ...prev, [msgId]: msgR };
    });
  }, []);

  const onPollUpdate = useCallback((poll) => {
    setPolls(prev => ({ ...prev, [poll.id]: { ...poll, decryptedData: prev[poll.id]?.decryptedData } }));
  }, []);

  const onSystem = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const onPin = useCallback(({ msgId }) => {
    setPinnedMsgId(msgId);
  }, []);

  const handlePollDecrypted = useCallback((pollId, data) => {
    setPolls(prev => ({ ...prev, [pollId]: { ...prev[pollId], decryptedData: data } }));
  }, []);

  const { connected, sendMessage, requestHistory, emitTyping, addReaction, votePoll, createPoll, pinMessage, kickUser } = useSocket({
    roomId, token,
    onMessage, onPresence: onPresenceUpdate, onHistory, onExpiring, onDeleted,
    onTyping, onReaction, onPollUpdate, onSystem, onPin, onKicked,
  });

  useEffect(() => {
    if (connected && keyReady) requestHistory();
  }, [connected, keyReady, requestHistory]);

  async function handleSend(text) {
    if (!keyReady) return;
    try {
      const encrypted = await encrypt(text);
      const reply = replyTo ? { id: replyTo.id, sender: replyTo.sender } : null;
      sendMessage(encrypted, reply);
      setReplyTo(null);
    } catch {}
  }

  async function handleCreatePoll({ question, options }) {
    if (!cryptoKeyRef.current) return;
    const pollId = crypto.randomUUID();
    const encrypted = await encryptMessage(JSON.stringify({ question, options }), cryptoKeyRef.current);
    createPoll(encrypted, pollId, options.length);
  }

  function handlePin(msgId) {
    pinMessage(msgId);
    setPinnedMsgId(msgId);
  }

  function handleKick(nickname) {
    if (window.confirm(`Remove "${nickname}" from the room?`)) kickUser(nickname);
  }

  function handleLeave() {
    storage.clearRoom(roomId);
    navigate('/');
  }

  async function handleCloseRoom() {
    setClosing(true);
    try { await closeRoom(roomId, ownerToken); storage.clearRoom(roomId); navigate('/'); }
    catch {} finally { setClosing(false); }
  }

  useEffect(() => {
    if (!token || !myNickname) navigate(`/join/${roomId}`);
  }, [token, myNickname, roomId, navigate]);

  if (isDead || roomError) return <DeadRoom navigate={navigate} t={t} reason={deadReason} />;

  const onlineCount = users.filter(u => u.status === 'online').length;
  const typerNames = Object.values(typingUsers).filter(n => n !== myNickname);
  const pinnedMsg = pinnedMsgId ? messages.find(m => m.id === pinnedMsgId) : null;
  const enrichedMessages = messages.map(m => ({ ...m, reactions: reactions[m.id] || {} }));

  return (
    <div className="h-[100dvh] bg-zinc-950 flex flex-col" style={{ '--accent': accentHex }}>
      <RoomHeader
        room={room}
        onlineCount={onlineCount}
        isExpiring={isExpiring}
        roomId={roomId}
        onToggleUsers={() => setShowUsers(v => !v)}
        accentHex={accentHex}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Action bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
            <button onClick={() => setModal('report')}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ⚑ {t('reportRoom')}
            </button>
            <div className="flex-1" />
            {/* Sound toggle */}
            <button
              onClick={() => setSoundOn(sound.toggle())}
              className="text-base leading-none opacity-60 hover:opacity-100 transition-opacity"
              title={soundOn ? 'Mute notifications' : 'Unmute notifications'}
            >
              {soundOn ? '🔔' : '🔕'}
            </button>
            {isOwner && (
              <button onClick={() => setModal('close')}
                className="text-xs text-red-600 hover:text-red-400 transition-colors font-medium">
                {t('closeRoom')}
              </button>
            )}
            <button onClick={() => setModal('leave')}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              {t('leaveRoom')}
            </button>
          </div>

          <PollDecryptor polls={polls} decrypt={decrypt} keyReady={keyReady} onDecrypted={handlePollDecrypted} />

          <ChatWindow
            messages={enrichedMessages}
            myNickname={myNickname}
            typingUsers={typerNames}
            polls={polls}
            onReact={addReaction}
            onReply={setReplyTo}
            onVote={votePoll}
            onPin={isOwner ? handlePin : null}
            isOwner={isOwner}
            pinnedMsg={pinnedMsg}
            accentHex={accentHex}
          />

          <MessageInput
            onSend={handleSend}
            onTyping={emitTyping}
            disabled={!connected || !keyReady}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onOpenPoll={() => setShowPoll(true)}
          />
        </main>

        <div className="hidden md:flex">
          <UserList users={users} myNickname={myNickname} isOwner={isOwner} onKick={handleKick} accentHex={accentHex} />
        </div>
      </div>

      {showUsers && (
        <div className="fixed inset-0 z-40 flex md:hidden" onClick={() => setShowUsers(false)}>
          <div className="flex-1 bg-black/60" />
          <div onClick={e => e.stopPropagation()}>
            <UserList users={users} myNickname={myNickname} isOwner={isOwner} onKick={handleKick} accentHex={accentHex} />
          </div>
        </div>
      )}

      {showPoll && <CreatePollModal onClose={() => setShowPoll(false)} onCreate={handleCreatePoll} />}

      {modal === 'leave' && (
        <ConfirmModal title="Leave Room"
          message={isOwner
            ? `You're the owner. After leaving, nobody can extend or close this room — it will auto-delete when it expires. To hand over control first, transfer ownership via the user list. Or close the room now instead.`
            : "You'll leave this room on this device. The room continues for others."}
          confirmLabel="Leave anyway" onConfirm={handleLeave} onClose={() => setModal(null)} />
      )}
      {modal === 'close' && (
        <ConfirmModal title="Close Room"
          message="This deletes all messages and disconnects everyone. Cannot be undone."
          confirmLabel="Close Room" variant="danger" loading={closing}
          onConfirm={handleCloseRoom} onClose={() => setModal(null)} />
      )}
      {modal === 'report' && <ReportModal roomId={roomId} onClose={() => setModal(null)} t={t} />}
    </div>
  );
}

function PollDecryptor({ polls, decrypt, keyReady, onDecrypted }) {
  const done = useRef(new Set());
  useEffect(() => {
    if (!keyReady) return;
    Object.entries(polls).forEach(async ([pollId, poll]) => {
      if (done.current.has(pollId) || !poll.encrypted_content) return;
      done.current.add(pollId);
      try {
        const json = await decrypt(poll.encrypted_content);
        onDecrypted(pollId, JSON.parse(json));
      } catch {}
    });
  }, [polls, keyReady, decrypt, onDecrypted]);
  return null;
}
