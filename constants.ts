
import { Sender, type Message } from './types';

export const INITIAL_BOT_MESSAGE: Message = {
    id: 'initial-message',
    text: "Hello! I'm here to listen. How are you feeling today? Feel free to share what's on your mind.",
    sender: Sender.Bot,
};
