import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  followUps?: string[];
  createdAt: number;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const keyFor = (userId: string) => `afyo.convs.${userId}`;

export async function loadConversations(userId: string): Promise<Conversation[]> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function saveConversations(
  userId: string,
  conversations: Conversation[],
): Promise<void> {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(conversations));
}

export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeConversation(): Conversation {
  const now = Date.now();
  return {
    id: newId(),
    title: 'New chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function deriveTitle(firstUserMessage: string): string {
  const trimmed = firstUserMessage.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 48) return trimmed;
  return trimmed.slice(0, 45) + '…';
}
