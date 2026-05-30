import { useState } from 'react';
import { PollCard } from './PollCard.jsx';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];
const URL_REGEX = /https?:\/\/[^\s<>"']+/g;

function MessageText({ text, isSelf, accentHex }) {
  if (!text) return null;
  const parts = [];
  let last = 0;
  let match;
  const re = new RegExp(URL_REGEX.source, 'g');
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const url = match[0];
    parts.push(
      <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className={`underline underline-offset-2 ${isSelf ? 'text-white/80 hover:text-white' : 'hover:opacity-80'}`}
        style={!isSelf ? { color: accentHex } : undefined}>
        {url}
      </a>
    );
    last = match.index + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isSelf, onReact, onReply, onPin, poll, myNickname, onVote, accentHex = '#10b981' }) {
  const [showEmojis, setShowEmojis] = useState(false);

  const reactionMap = message.reactions || {};
  const hasReactions = Object.values(reactionMap).some(uids => uids.length > 0);

  if (message.type === 'poll') {
    return (
      <div className={`flex flex-col gap-1 ${isSelf ? 'items-end self-end' : 'items-start self-start'}`}>
        {!isSelf && <span className="text-xs text-zinc-500 px-1">{message.sender}</span>}
        {poll
          ? <PollCard poll={poll} decryptedData={poll?.decryptedData} myNickname={myNickname} onVote={onVote} isSelf={isSelf} accentHex={accentHex} />
          : <div className="bg-zinc-800 rounded-2xl px-4 py-3"><p className="text-xs text-zinc-500 animate-pulse">📊 Loading poll...</p></div>
        }
        <span className="text-xs text-zinc-600 px-1">{formatTime(message.timestamp)}</span>
      </div>
    );
  }

  return (
    <div className={`group flex flex-col gap-0.5 max-w-xs lg:max-w-md ${isSelf ? 'items-end self-end' : 'items-start self-start'}`}>
      {!isSelf && <span className="text-xs text-zinc-500 px-1">{message.sender}</span>}

      {message.replyTo && (
        <div className={`text-xs px-3 py-1.5 rounded-xl border-l-2 bg-zinc-800/80 max-w-full mb-0.5 ${isSelf ? 'self-end' : 'self-start'}`}
          style={{ borderColor: accentHex }}>
          <span className="font-medium" style={{ color: accentHex }}>{message.replyTo.sender}</span>
          <p className="text-zinc-400 truncate mt-0.5">{message.replyTo.text}</p>
        </div>
      )}

      <div className={`flex items-end gap-1 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`relative px-3 py-2 rounded-2xl text-sm break-words cursor-pointer select-text
            ${isSelf ? 'text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'}`}
          style={isSelf ? { background: accentHex } : undefined}
          onClick={() => onReply?.(message)}
        >
          <MessageText text={message.text} isSelf={isSelf} accentHex={accentHex} />
        </div>

        {/* Actions: emoji + pin */}
        <div className={`flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${hasReactions ? 'opacity-100' : ''}`}>
          <button onClick={(e) => { e.stopPropagation(); setShowEmojis(v => !v); }}
            className="text-base leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 transition-colors">
            🙂
          </button>
          {onPin && (
            <button onClick={(e) => { e.stopPropagation(); onPin(message.id); }}
              className="text-base leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 transition-colors"
              title="Pin message">
              📌
            </button>
          )}
        </div>
      </div>

      {showEmojis && (
        <div className={`flex gap-1 px-2 py-1.5 bg-zinc-800 rounded-full border border-zinc-700 ${isSelf ? 'self-end' : 'self-start'}`}>
          {EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => { onReact?.(message.id, emoji); setShowEmojis(false); }}
              className="text-base hover:scale-125 transition-transform">
              {emoji}
            </button>
          ))}
        </div>
      )}

      {hasReactions && (
        <div className={`flex flex-wrap gap-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
          {Object.entries(reactionMap).filter(([, uids]) => uids.length > 0).map(([emoji, uids]) => (
            <button key={emoji} onClick={() => onReact?.(message.id, emoji)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-zinc-800 text-xs hover:bg-zinc-700 transition-colors">
              <span>{emoji}</span>
              <span className="text-zinc-400">{uids.length}</span>
            </button>
          ))}
        </div>
      )}

      <span className="text-xs text-zinc-600 px-1">{formatTime(message.timestamp)}</span>
    </div>
  );
}
