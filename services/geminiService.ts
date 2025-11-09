import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, Content } from "@google/genai";
import { type Message, Sentiment, Sender } from '../types';

// Lazily initialize the AI client to prevent app crash on load.
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable is not set. Please ensure it is configured correctly.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const systemInstruction = `You are a compassionate and supportive mental health chatbot. Your goal is to help users explore their feelings in a safe and non-judgmental space.
1. Analyze the user's message to understand their emotional state. Identify the primary sentiment from this list: HAPPY, SAD, ANXIOUS, ANGRY, STRESSED, NEUTRAL.
2. Craft a thoughtful, empathetic, and supportive response that validates the user's feelings.
3. If the sentiment is negative (SAD, ANXIOUS, ANGRY, STRESSED), offer a simple coping mechanism, a positive affirmation, or gently suggest talking to a friend, family member, or professional.
4. Do NOT provide medical advice or diagnoses. If the user seems to be in crisis, you MUST prioritize suggesting they contact a crisis hotline or mental health professional immediately.
5. Keep your responses concise and easy to understand.
6. You MUST respond in the specified JSON format.`;

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
    {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
    {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];


export const getBotResponse = async (userMessage: string, chatHistory: Message[]): Promise<{ sentiment: Sentiment; response: string }> => {
    try {
        const aiClient = getAiClient();

        const contents: Content[] = chatHistory.map(msg => ({
            role: msg.sender === Sender.User ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        contents.push({
            role: 'user',
            parts: [{text: userMessage}]
        });

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            safetySettings,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: {
                            type: Type.STRING,
                            enum: Object.values(Sentiment),
                            description: 'The dominant sentiment detected in the user\'s message.'
                        },
                        response: {
                            type: Type.STRING,
                            description: 'Your empathetic and supportive response to the user.'
                        }
                    },
                    required: ['sentiment', 'response']
                },
                temperature: 0.7,
                topP: 0.9,
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        return data as { sentiment: Sentiment; response: string };
    } catch (error) {
        console.error("Error fetching bot response:", error);
        // Re-throw the error to be handled by the UI component
        throw error;
    }
};
