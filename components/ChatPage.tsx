import React, { useState, useEffect, useRef } from 'react';
import { type Message, type ChatSession, Sender } from '../types';
import { INITIAL_BOT_MESSAGE } from '../constants';
import { getBotResponse, generateChatTitle } from '../services/geminiService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LogoutIcon from './icons/LogoutIcon';
import SentimentTracker from './SentimentTracker';
import ChatHistory from './ChatHistory';

interface ChatPageProps {
    onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onLogout }) => {
  const [allChats, setAllChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const chats: ChatSession[] = JSON.parse(savedHistory);
      if (chats.length > 0) {
        setAllChats(chats);
        // Activate the most recently updated chat
        const sortedChats = chats.sort((a,b) => b.lastUpdated - a.lastUpdated);
        setActiveChatId(sortedChats[0].id);
      } else {
        handleNewChat();
      }
    } else {
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    if (allChats.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(allChats));
    } else {
        localStorage.removeItem('chatHistory');
    }
  }, [allChats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allChats, activeChatId]); // Rerun when messages of active chat change

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      messages: [INITIAL_BOT_MESSAGE],
      lastUpdated: Date.now(),
    };
    setAllChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (id: string) => {
    const remainingChats = allChats.filter(chat => chat.id !== id);
    setAllChats(remainingChats);

    if (activeChatId === id) {
      if (remainingChats.length > 0) {
        const sortedChats = remainingChats.sort((a,b) => b.lastUpdated - a.lastUpdated);
        setActiveChatId(sortedChats[0].id);
      } else {
        handleNewChat();
      }
    }
  };
  
  const handleSendMessage = async (text: string) => {
    if (!activeChatId) return;

    const userMessage: Message = { id: `user-${Date.now()}`, text, sender: Sender.User };
    const activeChat = allChats.find(c => c.id === activeChatId);
    const isFirstUserMessage = activeChat ? activeChat.messages.filter(m => m.sender === Sender.User).length === 0 : false;

    // Immediately update UI with user's message
    const updatedChatsWithUserMsg = allChats.map(chat => 
        chat.id === activeChatId 
        ? { ...chat, messages: [...chat.messages, userMessage], lastUpdated: Date.now() }
        : chat
    );
    setAllChats(updatedChatsWithUserMsg);
    setIsLoading(true);
    setError(null);

    // Generate title for new chats after first user message
    if (isFirstUserMessage) {
        generateChatTitle(text).then(title => {
            setAllChats(prevChats => prevChats.map(chat => 
                chat.id === activeChatId ? { ...chat, title } : chat
            ));
        });
    }

    try {
      const currentChatHistory = activeChat?.messages.filter(msg => msg.id !== 'initial-message') || [];
      const { sentiment, response } = await getBotResponse(text, currentChatHistory);
      
      const botMessage: Message = { id: `bot-${Date.now()}`, text: response, sender: Sender.Bot };
      
      setAllChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
            const updatedMessages = chat.messages.map(msg => 
                msg.id === userMessage.id ? { ...msg, sentiment } : msg
            );
            return { ...chat, messages: [...updatedMessages, botMessage] };
        }
        return chat;
      }));

    } catch (err) {
      console.error(err);
      setError("Failed to get a response from the bot. Please check your connection and API key.");
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I encountered an error and couldn't process your message.",
        sender: Sender.Bot,
      };
      setAllChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat
      ));
    } finally {
      setIsLoading(false);
    }
  };
  
  const activeChat = allChats.find(chat => chat.id === activeChatId);
  const messages = activeChat?.messages || [];

  return (
    <div className="flex h-full">
      <ChatHistory 
        chats={allChats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-1 flex flex-col">
        <header className="relative p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-center">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mindful AI Chatbot</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl mx-auto">
            This is an AI for supportive conversations. It is not a substitute for professional medical advice. If you are in a crisis, please contact a local emergency number.
            </p>
            <SentimentTracker messages={messages} />
            <button onClick={onLogout} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Logout">
                <LogoutIcon />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-900">
            <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 my-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                    <div className="w-5 h-5 animate-pulse rounded-full bg-slate-400"></div>
                    </div>
                <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 rounded-bl-none">
                    <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
                </div>
            )}
            {error && <p className="text-red-500 text-center my-4">{error}</p>}
            <div ref={chatEndRef} />
            </div>
        </main>

        <footer className="sticky bottom-0 bg-slate-100 dark:bg-slate-900">
            <div className="max-w-4xl mx-auto">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatPage;
