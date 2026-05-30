import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';

export function ChatWindow({ messages, myNickname }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isSelf={msg.sender === myNickname}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
