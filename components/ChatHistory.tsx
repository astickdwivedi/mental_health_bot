
import React from 'react';
import { type ChatSession } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface ChatHistoryProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) => {
  const sortedChats = [...chats].sort((a, b) => b.lastUpdated - a.lastUpdated);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onSelectChat from firing
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteChat(id);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          {sortedChats.map((chat) => (
            <li key={chat.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectChat(chat.id);
                }}
                className={`group flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors ${
                  activeChatId === chat.id
                    ? 'bg-blue-100 text-blue-800 dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span className="truncate flex-1 pr-2">{chat.title}</span>
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-300 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete chat"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ChatHistory;
