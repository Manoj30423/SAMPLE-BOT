export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  attachments?: MessageAttachment[];
  isError?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Meta';
  badge: string;
  description: string;
  accentColor: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  modelId: string;
  messages: Message[];
}

export type TimeGroup = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Older';

export interface GroupedConversations {
  group: TimeGroup;
  conversations: Conversation[];
}
