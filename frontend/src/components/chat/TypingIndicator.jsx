export function TypingIndicator({ typers }) {
  if (!typers.length) return null;

  const names = typers.slice(0, 2).join(', ');
  const extra = typers.length > 2 ? ` +${typers.length - 2}` : '';
  const verb = typers.length === 1 ? 'tengah taip' : 'tengah taip';

  return (
    <div className="px-4 py-1.5 flex items-center gap-2 min-h-[28px]">
      <div className="flex gap-0.5 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="block w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-500 truncate">
        <span className="text-zinc-400">{names}{extra}</span> {verb}...
      </span>
    </div>
  );
}
