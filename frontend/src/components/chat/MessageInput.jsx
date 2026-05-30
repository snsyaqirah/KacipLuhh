import { useState } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { Button } from '../ui/Button.jsx';

export function MessageInput({ onSend, disabled }) {
  const { t } = useLang();
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-zinc-800 flex gap-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={t('typeMessage')}
        disabled={disabled}
        rows={1}
        maxLength={2000}
        className="flex-1 resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors disabled:opacity-50"
      />
      <Button type="submit" disabled={disabled || !text.trim()} size="md">
        {t('send')}
      </Button>
    </form>
  );
}
