import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

export function ChatWindow({ messages, myNickname, typingUsers, polls, onReact, onReply, onVote, onPin, isOwner, pinnedMsg, accentHex }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 250) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

  function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 250);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Pinned message banner */}
      {pinnedMsg && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-sm flex-shrink-0">📌</span>
          <p className="text-xs text-zinc-300 truncate flex-1">{pinnedMsg.text}</p>
          {isOwner && (
            <button onClick={() => onPin(null)}
              className="text-zinc-600 hover:text-zinc-300 flex-shrink-0 text-lg leading-none transition-colors">
              ×
            </button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
      >
        {messages.map(msg => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center py-0.5">
                <span className="text-xs text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                  {msg.text}
                </span>
              </div>
            );
          }
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSelf={msg.sender === myNickname}
              myNickname={myNickname}
              onReact={onReact}
              onReply={onReply}
              onPin={isOwner ? onPin : null}
              poll={msg.type === 'poll' ? polls[msg.pollId] : undefined}
              onVote={onVote}
              accentHex={accentHex}
            />
          );
        })}
        <TypingIndicator typers={typingUsers} />
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full border border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all shadow-lg z-10"
        >
          ↓
        </button>
      )}
    </div>
  );
}
