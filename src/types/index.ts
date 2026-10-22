export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  preferredLanguage: string;
  theme: 'dark' | 'light' | 'system';
  voiceName: string;
  autoSpeakResponse: boolean;
  hapticFeedback: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  image?: {
    data: string;
    mimeType: string;
    previewUrl?: string;
  };
  audioBase64?: string;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Work' | 'Study' | 'Ideas' | 'AI Generated';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  datetime: string;
  completed: boolean;
  notified?: boolean;
  createdAt: string;
}

export interface PhoneTool {
  id: string;
  title: string;
  category: 'Communication' | 'Device Control' | 'Hardware' | 'System';
  description: string;
  iconName: string;
  supported: boolean;
  androidIntent: string;
  permissionRequired?: string;
  actionType: 'dial' | 'sms' | 'camera' | 'battery' | 'vibrate' | 'share' | 'settings' | 'copy';
}
