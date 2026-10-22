import { ChatMessage, Conversation } from '../types/index.ts';

export function createNewConversation(customTitle?: string): Conversation {
  const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    title: customTitle || 'New Conversation',
    messages: [
      {
        id: 'msg_welcome_' + Date.now(),
        role: 'assistant',
        content: "Hello! I'm AIPAKO, your personal AI assistant. How can I help you today? You can ask questions, brainstorm writing, translate text, inspect images, or explore device tools.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateConversationTitle(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return 'New Conversation';
  const clean = prompt.trim().replace(/^([a-z\s]+:)/i, '').replace(/[^\w\s-]/g, '');
  const words = clean.split(/\s+/).slice(0, 5).join(' ');
  if (!words) return 'New Conversation';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function addMessageToConversation(
  conversation: Conversation,
  role: 'user' | 'assistant',
  content: string,
  extra?: { image?: any; audioBase64?: string; error?: boolean }
): Conversation {
  const newMessage: ChatMessage = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    role,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    image: extra?.image,
    audioBase64: extra?.audioBase64,
    error: extra?.error,
  };

  let newTitle = conversation.title;
  // If first user message and title is still "New Conversation", auto-generate title
  if (role === 'user' && (conversation.title === 'New Conversation' || conversation.messages.length <= 1)) {
    newTitle = generateConversationTitle(content);
  }

  return {
    ...conversation,
    title: newTitle,
    messages: [...conversation.messages, newMessage],
    updatedAt: new Date().toISOString(),
  };
}

export function pruneConversationForContext(
  messages: ChatMessage[],
  maxTurns: number = 10
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // Filter out system welcome message or errors
  const valid = messages.filter((m) => !m.error && (m.role === 'user' || m.role === 'assistant'));
  const recent = valid.slice(-maxTurns);
  return recent.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
}
