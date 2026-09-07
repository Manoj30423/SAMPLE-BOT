import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  PanelLeftClose,
  Sparkles,
  Bot
} from 'lucide-react';
import { Conversation, GroupedConversations } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  groupedConversations: GroupedConversations[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  groupedConversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  isMobile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEditing = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  // Filter conversations by search query
  const filteredGroups = groupedConversations
    .map((g) => ({
      group: g.group,
      conversations: g.conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter((g) => g.conversations.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 sm:w-72 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800 select-none">
      {/* Top Header: App Branding & Close sidebar button */}
      <div className="p-3.5 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            Nexus AI
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* "+ New Chat" Action Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            if (isMobile) onToggle();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-xs sm:text-sm shadow-xs transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span>New Chat</span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">⌘N</span>
        </button>

        {/* Quick Search in sidebar */}
        <div className="relative mt-2.5">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-200/50 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 outline-hidden text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List Grouped by Date */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1">
        {filteredGroups.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            {searchQuery ? 'No matching conversations' : 'No conversations yet'}
          </div>
        ) : (
          filteredGroups.map(({ group, conversations }) => (
            <div key={group} className="space-y-1">
              {/* Group Category Header */}
              <div className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                {group}
              </div>

              {/* Conversation items */}
              {conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isEditing = editingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectConversation(conv.id);
                        if (isMobile) onToggle();
                      }
                    }}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-zinc-400 group-hover:text-zinc-500'
                        }`}
                      />

                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(conv.id, e);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            className="w-full bg-white dark:bg-zinc-900 border border-indigo-400 rounded px-1.5 py-0.5 text-xs text-zinc-900 dark:text-zinc-100 outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={(e) => saveEditing(conv.id, e)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="truncate block flex-1">{conv.title}</span>
                      )}
                    </div>

                    {/* Actions: Rename / Delete */}
                    {!isEditing && (
                      <div
                        className={`flex items-center gap-0.5 ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                      >
                        <button
                          type="button"
                          onClick={(e) => startEditing(conv, e)}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          title="Rename title"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-1 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-zinc-400" />
          <span>Local Storage Active</span>
        </div>
        <span>v2.5</span>
      </div>
    </div>
  );

  // Mobile Drawer with Backdrop Overlay
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={onToggle}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />
        {/* Drawer slide */}
        <div
          className={`absolute top-0 bottom-0 left-0 transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Desktop Collapsible
  return (
    <aside
      className={`transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 ${
        isOpen ? 'w-64 sm:w-72' : 'w-0'
      }`}
    >
      {sidebarContent}
    </aside>
  );
};
