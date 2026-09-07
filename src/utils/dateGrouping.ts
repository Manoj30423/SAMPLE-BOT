import { Conversation, GroupedConversations, TimeGroup } from '../types';

export function groupConversationsByDate(conversations: Conversation[]): GroupedConversations[] {
  // Sort conversations by updatedAt descending
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;

  const groups: Record<TimeGroup, Conversation[]> = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Older': []
  };

  for (const conv of sorted) {
    const timestamp = conv.updatedAt || conv.createdAt;
    if (timestamp >= todayStart) {
      groups['Today'].push(conv);
    } else if (timestamp >= yesterdayStart) {
      groups['Yesterday'].push(conv);
    } else if (timestamp >= sevenDaysAgo) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups['Older'].push(conv);
    }
  }

  const order: TimeGroup[] = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];
  return order
    .map(group => ({
      group,
      conversations: groups[group]
    }))
    .filter(g => g.conversations.length > 0);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDateFull(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
