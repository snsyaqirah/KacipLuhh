import { useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';

export function CreatePollModal({ onClose, onCreate }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  function updateOption(i, val) {
    setOptions(prev => prev.map((o, idx) => idx === i ? val : o));
  }

  function addOption() {
    if (options.length < 5) setOptions(prev => [...prev, '']);
  }

  function removeOption(i) {
    if (options.length > 2) setOptions(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) return;
    onCreate({ question: question.trim(), options: validOptions });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50"
      onClick={onClose}>
      <div className="bg-zinc-900 rounded-2xl w-full max-w-sm border border-zinc-800"
        onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <h3 className="font-semibold text-zinc-100">📊 Buat Poll</h3>

            <Input
              label="Soalan"
              placeholder="Nak makan apa?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              maxLength={200}
              autoFocus
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Pilihan</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Pilihan ${i + 1}`}
                    maxLength={100}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)}
                      className="text-zinc-600 hover:text-zinc-400 px-2">×</button>
                  )}
                </div>
              ))}
              {options.length < 5 && (
                <button type="button" onClick={addOption}
                  className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                  + Tambah pilihan
                </button>
              )}
            </div>
          </div>

          <div className="flex border-t border-zinc-800">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors">
              Batal
            </button>
            <button type="submit"
              disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
              className="flex-1 py-3 text-sm font-medium text-emerald-400 hover:bg-zinc-800 border-l border-zinc-800 transition-colors disabled:opacity-40">
              Hantar Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
