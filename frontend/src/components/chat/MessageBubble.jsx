function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isSelf }) {
  return (
    <div className={`flex flex-col gap-0.5 max-w-xs lg:max-w-md ${isSelf ? 'items-end self-end' : 'items-start self-start'}`}>
      {!isSelf && (
        <span className="text-xs text-zinc-500 px-1">{message.sender}</span>
      )}
      <div className={`px-3 py-2 rounded-2xl text-sm break-words ${isSelf ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'}`}>
        {message.text}
      </div>
      <span className="text-xs text-zinc-600 px-1">{formatTime(message.timestamp)}</span>
    </div>
  );
}
