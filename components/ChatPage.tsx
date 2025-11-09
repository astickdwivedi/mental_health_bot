import React, { useState, useEffect, useRef } from 'react';
import { type Message, Sender } from '../types';
import { INITIAL_BOT_MESSAGE } from '../constants';
import { getBotResponse } from '../services/geminiService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LogoutIcon from './icons/LogoutIcon';
import SentimentTracker from './SentimentTracker';

interface ChatPageProps {
    onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: Sender.User,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const chatHistory = messages.filter(msg => msg.id !== 'initial-message');
      const { sentiment, response } = await getBotResponse(text, chatHistory);
      
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, sentiment } : msg
        )
      );

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        sender: Sender.Bot,
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      console.error(err);
      setError("Failed to get a response from the bot. Please check your connection and API key.");
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I encountered an error and couldn't process your message.",
        sender: Sender.Bot,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <header className="relative p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mindful AI Chatbot</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl mx-auto">
          This is an AI for supportive conversations. It is not a substitute for professional medical advice. If you are in a crisis, please contact a local emergency number.
        </p>
        <SentimentTracker messages={messages} />
        <button onClick={onLogout} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Logout">
            <LogoutIcon />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
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

      <footer className="sticky bottom-0">
        <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </>
  );
};

export default ChatPage;