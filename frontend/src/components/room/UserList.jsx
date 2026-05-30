import { useLang } from '../../context/LangContext.jsx';

export function UserList({ users, myNickname }) {
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
          <UserRow key={u.id} user={u} isSelf={u.nickname === myNickname} />
        ))}

        {offline.length > 0 && (
          <>
            <div className="px-1 pt-3 pb-1">
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                {t('offline')} · {offline.length}
              </span>
            </div>
            {offline.map(u => (
              <UserRow key={u.id} user={u} isSelf={u.nickname === myNickname} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

function UserRow({ user, isSelf }) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-2 px-1 py-1.5 rounded">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
      <span className={`text-sm truncate ${user.status === 'online' ? 'text-zinc-200' : 'text-zinc-500'}`}>
        {user.nickname}
      </span>
      {isSelf && (
        <span className="text-xs text-zinc-600 flex-shrink-0">{t('youBadge')}</span>
      )}
    </div>
  );
}
