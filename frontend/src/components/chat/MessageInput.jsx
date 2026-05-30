import { useState, useRef, useCallback } from 'react';
import { useLang } from '../../context/LangContext.jsx';

export function MessageInput({ onSend, onTyping, disabled, replyTo, onCancelReply, onOpenPoll }) {
  const { t } = useLang();
  const [text, setText] = useState('');
  const typingTimeout = useRef(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping?.(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping?.(false);
    }, 2000);
  }, [onTyping]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    clearTimeout(typingTimeout.current);
    isTypingRef.current = false;
    onTyping?.(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
  }

  function handleChange(e) {
    setText(e.target.value);
    if (e.target.value) handleTyping();
  }

  return (
    <div className="border-t border-zinc-800">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
          <div className="flex-1 border-l-2 border-emerald-500 pl-2 min-w-0">
            <p className="text-xs text-emerald-400 font-medium">{replyTo.sender}</p>
            <p className="text-xs text-zinc-400 truncate">{replyTo.text}</p>
          </div>
          <button onClick={onCancelReply} className="text-zinc-500 hover:text-zinc-300 flex-shrink-0 text-lg leading-none">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 px-4 py-3">
        {/* Poll button */}
        <button
          type="button"
          onClick={onOpenPoll}
          disabled={disabled}
          title="Buat poll"
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          📊
        </button>

        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder={t('typeMessage')}
          disabled={disabled}
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors disabled:opacity-50 max-h-32"
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
