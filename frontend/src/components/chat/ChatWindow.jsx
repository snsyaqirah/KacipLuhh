import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

export function ChatWindow({ messages, myNickname, typingUsers, polls, onReact, onReply, onVote }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isSelf={msg.sender === myNickname}
          myNickname={myNickname}
          onReact={onReact}
          onReply={onReply}
          poll={msg.type === 'poll' ? polls[msg.pollId] : undefined}
          onVote={onVote}
        />
      ))}
      <TypingIndicator typers={typingUsers} />
      <div ref={bottomRef} />
    </div>
  );
}
