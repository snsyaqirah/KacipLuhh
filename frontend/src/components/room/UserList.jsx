import { useLang } from '../../context/LangContext.jsx';

export function UserList({ users, myNickname, isOwner, onKick, accentHex = '#10b981' }) {
  const { t } = useLang();
  const online = users.filter(u => u.status === 'online');
  const offline = users.filter(u => u.status === 'offline');

  return (
    <aside className="w-48 flex-shrink-0 border-l border-zinc-800 bg-zinc-900 flex flex-col overflow-y-auto">
      <div className="px-3 py-3 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {t('online')} · {online.length}
        </span>
      </div>

      <div className="flex-1 px-2 py-2 space-y-0.5">
        {online.map(u => (
          <UserRow key={u.id} user={u} isSelf={u.nickname === myNickname}
            isOwner={isOwner} onKick={onKick} accentHex={accentHex} />
        ))}
        {offline.length > 0 && (
          <>
            <div className="px-1 pt-3 pb-1">
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                {t('offline')} · {offline.length}
              </span>
            </div>
            {offline.map(u => (
              <UserRow key={u.id} user={u} isSelf={u.nickname === myNickname}
                isOwner={isOwner} onKick={onKick} accentHex={accentHex} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

function UserRow({ user, isSelf, isOwner, onKick, accentHex }) {
  const { t } = useLang();
  const canKick = isOwner && !isSelf;

  return (
    <div className="group flex items-center gap-2 px-1 py-1.5 rounded hover:bg-zinc-800/50">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: user.status === 'online' ? accentHex : '#52525b' }} />
      <span className={`text-sm truncate flex-1 ${user.status === 'online' ? 'text-zinc-200' : 'text-zinc-500'}`}>
        {user.nickname}
      </span>
      {isSelf && <span className="text-xs text-zinc-600 flex-shrink-0">{t('youBadge')}</span>}
      {canKick && (
        <button
          onClick={() => onKick?.(user.nickname)}
          className="opacity-0 group-hover:opacity-100 text-xs text-red-600 hover:text-red-400 flex-shrink-0 transition-all"
          title="Remove user"
        >
          kick
        </button>
      )}
    </div>
  );
}
