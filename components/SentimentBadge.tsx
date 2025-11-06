
import React from 'react';
import { Sentiment } from '../types';

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

const sentimentStyles: Record<Sentiment, { dot: string; text: string; label: string }> = {
  [Sentiment.Happy]: { dot: 'bg-green-400', text: 'text-green-800 dark:text-green-200', label: 'Happy' },
  [Sentiment.Sad]: { dot: 'bg-blue-400', text: 'text-blue-800 dark:text-blue-200', label: 'Sad' },
  [Sentiment.Anxious]: { dot: 'bg-yellow-400', text: 'text-yellow-800 dark:text-yellow-200', label: 'Anxious' },
  [Sentiment.Angry]: { dot: 'bg-red-400', text: 'text-red-800 dark:text-red-200', label: 'Angry' },
  [Sentiment.Stressed]: { dot: 'bg-purple-400', text: 'text-purple-800 dark:text-purple-200', label: 'Stressed' },
  [Sentiment.Neutral]: { dot: 'bg-gray-400', text: 'text-gray-800 dark:text-gray-200', label: 'Neutral' },
};

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
  const style = sentimentStyles[sentiment];

  if (!style) return null;

  return (
    <div className="group relative flex items-center gap-2 mt-2">
      <div className={`w-3 h-3 rounded-full ${style.dot}`}></div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{style.label.toLowerCase()}</span>
    </div>
  );
};

export default SentimentBadge;
