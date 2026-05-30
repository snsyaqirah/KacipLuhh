import { useState } from 'react';
import { PollCard } from './PollCard.jsx';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isSelf, onReact, onReply, poll, myNickname, onVote }) {
  const [showEmojis, setShowEmojis] = useState(false);

  const reactionMap = message.reactions || {};
  const hasReactions = Object.values(reactionMap).some(uids => uids.length > 0);

  if (message.type === 'poll' && poll) {
    return (
      <div className={`flex flex-col gap-1 ${isSelf ? 'items-end self-end' : 'items-start self-start'}`}>
        {!isSelf && <span className="text-xs text-zinc-500 px-1">{message.sender}</span>}
        <PollCard
          poll={poll}
          decryptedData={message.pollData}
          myNickname={myNickname}
          onVote={onVote}
          isSelf={isSelf}
        />
        <span className="text-xs text-zinc-600 px-1">{formatTime(message.timestamp)}</span>
      </div>
    );
  }

  return (
    <div className={`group flex flex-col gap-0.5 max-w-xs lg:max-w-md ${isSelf ? 'items-end self-end' : 'items-start self-start'}`}>
      {!isSelf && <span className="text-xs text-zinc-500 px-1">{message.sender}</span>}

      {/* Reply preview */}
      {message.replyTo && (
        <div className={`text-xs px-3 py-1.5 rounded-xl border-l-2 border-emerald-500 bg-zinc-800/80 max-w-full mb-0.5 ${isSelf ? 'self-end' : 'self-start'}`}>
          <span className="text-emerald-400 font-medium">{message.replyTo.sender}</span>
          <p className="text-zinc-400 truncate mt-0.5">{message.replyTo.text}</p>
        </div>
      )}

      <div className={`flex items-end gap-1 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`relative px-3 py-2 rounded-2xl text-sm break-words cursor-pointer
            ${isSelf ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'}`}
          onClick={() => onReply?.(message)}
        >
          {message.text}
        </div>

        {/* Emoji trigger — visible on hover or when reactions exist */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowEmojis(v => !v); }}
          className={`text-sm opacity-0 group-hover:opacity-100 transition-opacity ${hasReactions ? 'opacity-100' : ''}`}
        >
          🙂
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className={`flex gap-1 px-2 py-1.5 bg-zinc-800 rounded-full border border-zinc-700 ${isSelf ? 'self-end' : 'self-start'}`}>
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => { onReact?.(message.id, emoji); setShowEmojis(false); }}
              className="text-base hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Reaction counts */}
      {hasReactions && (
        <div className={`flex flex-wrap gap-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
          {Object.entries(reactionMap).filter(([, uids]) => uids.length > 0).map(([emoji, uids]) => (
            <button
              key={emoji}
              onClick={() => onReact?.(message.id, emoji)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-zinc-800 text-xs hover:bg-zinc-700 transition-colors"
            >
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
