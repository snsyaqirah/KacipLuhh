export function PollCard({ poll, decryptedData, myNickname, onVote, isSelf }) {
  if (!decryptedData) {
    return (
      <div className={`max-w-xs rounded-2xl bg-zinc-800 px-4 py-3 ${isSelf ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
        <p className="text-xs text-zinc-500">📊 Loading poll...</p>
      </div>
    );
  }

  const { question, options } = decryptedData;
  const totalVotes = poll.votes
    ? Object.values(poll.votes).reduce((sum, uids) => sum + uids.length, 0)
    : 0;

  const myVoteIdx = poll.votes
    ? Object.entries(poll.votes).find(([, uids]) => uids.includes(myNickname))?.[0]
    : null;

  return (
    <div className={`max-w-xs w-64 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden ${isSelf ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
      <div className="px-4 pt-3 pb-2 border-b border-zinc-700">
        <p className="text-xs font-medium text-emerald-400 mb-1">📊 Poll</p>
        <p className="text-sm text-zinc-100 font-medium">{question}</p>
      </div>
      <div className="divide-y divide-zinc-700/50">
        {options.map((opt, i) => {
          const votes = poll.votes?.[i]?.length ?? 0;
          const pct = totalVotes ? Math.round(votes / totalVotes * 100) : 0;
          const isMyVote = String(i) === String(myVoteIdx);

          return (
            <button
              key={i}
              onClick={() => onVote(poll.id, i)}
              className="relative w-full text-left overflow-hidden"
            >
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${isMyVote ? 'bg-emerald-600/30' : 'bg-zinc-700/30'}`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-zinc-200 flex items-center gap-2">
                  {isMyVote && <span className="text-emerald-400">✓</span>}
                  {opt}
                </span>
                <span className="text-xs text-zinc-500 tabular-nums ml-2">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="px-4 py-2 text-xs text-zinc-600">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
    </div>
  );
}
