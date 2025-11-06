
import React from 'react';
import { type Message, Sender } from '../types';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';
import SentimentBadge from './SentimentBadge';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
          <BotIcon className="w-5 h-5" />
        </div>
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        {isUser && message.sentiment && (
          <SentimentBadge sentiment={message.sentiment} />
        )}
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
