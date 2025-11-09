import React from 'react';
import { type Message, Sender, Sentiment } from '../types';

interface SentimentTrackerProps {
  messages: Message[];
}

const sentimentStyles: Record<Sentiment, { dot: string; label: string }> = {
  [Sentiment.Happy]: { dot: 'bg-green-400', label: 'Happy' },
  [Sentiment.Sad]: { dot: 'bg-blue-400', label: 'Sad' },
  [Sentiment.Anxious]: { dot: 'bg-yellow-400', label: 'Anxious' },
  [Sentiment.Angry]: { dot: 'bg-red-400', label: 'Angry' },
  [Sentiment.Stressed]: { dot: 'bg-purple-400', label: 'Stressed' },
  [Sentiment.Neutral]: { dot: 'bg-gray-400', label: 'Neutral' },
};

const SentimentTracker: React.FC<SentimentTrackerProps> = ({ messages }) => {
  const userSentiments = messages
    .filter((msg) => msg.sender === Sender.User && msg.sentiment)
    .map((msg) => msg.sentiment!);

  if (userSentiments.length < 2) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your Sentiment Journey:</p>
      <div className="flex items-center gap-1.5">
        {userSentiments.map((sentiment, index) => {
          const style = sentimentStyles[sentiment];
          return (
            <div key={index} className="group relative flex items-center">
              <div className={`w-3 h-3 rounded-full ${style.dot} transition-transform group-hover:scale-125`}></div>
               <div className="absolute bottom-full mb-2 w-max origin-bottom scale-95 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                <div className="relative bg-slate-900 dark:bg-slate-700 text-white text-xs rounded py-1 px-2">
                  {style.label}
                  <svg className="absolute left-1/2 -translate-x-1/2 top-full h-2 w-full text-slate-900 dark:text-slate-700" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SentimentTracker;
