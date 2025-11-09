
export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export enum Sentiment {
  Happy = 'HAPPY',
  Sad = 'SAD',
  Anxious = 'ANXIOUS',
  Angry = 'ANGRY',
  Stressed = 'STRESSED',
  Neutral = 'NEUTRAL',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  sentiment?: Sentiment;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}
