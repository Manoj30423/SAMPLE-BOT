import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Conversation, Message, AIModel, MessageAttachment } from './types';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from './data/models';
import { INITIAL_CONVERSATIONS } from './data/initialConversations';
import { groupConversationsByDate } from './utils/dateGrouping';
import { generateAIResponse } from './services/aiService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';

const STORAGE_KEY_CONVERSATIONS = 'ai_chat_conversations_v1';
const STORAGE_KEY_THEME = 'ai_chat_theme_v1';
const STORAGE_KEY_MODEL = 'ai_chat_model_v1';

export default function App() {
  // 1. Theme State (Dark / Light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // 2. Responsive Screen Detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Models State
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    const savedModelId = localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL_ID;
    return AVAILABLE_MODELS.find((m) => m.id === savedModelId) || AVAILABLE_MODELS[0];
  });

  const handleSelectModel = (model: AIModel) => {
    setSelectedModel(model);
    localStorage.setItem(STORAGE_KEY_MODEL, model.id);
  };

  // 4. Conversations State (with LocalStorage persistence)
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CONVERSATIONS;
  });

  // Active conversation ID
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return conversations.length > 0 ? conversations[0].id : null;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [conversations]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Grouped conversations for the sidebar
  const groupedConversations = useMemo(() => {
    return groupConversationsByDate(conversations);
  }, [conversations]);

  // 5. Loading & Abort Controller for AI generation
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Create a New Chat
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId: selectedModel.id,
      messages: []
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Rename Conversation Title
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Clear all chats
  const handleClearAllChats = () => {
    setConversations([]);
    setActiveConversationId(null);
    handleNewChat();
  };

  // Generate title from first prompt
  const generateTitleFromPrompt = (text: string) => {
    const cleaned = text.replace(/[\n\r]/g, ' ').trim();
    if (cleaned.length <= 32) return cleaned;
    return cleaned.substring(0, 32) + '...';
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Send Message Handler
  const handleSendMessage = async (text: string, attachments?: MessageAttachment[]) => {
    if ((!text.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    let targetConvId = activeConversationId;
    let isFirstMessageInConv = false;

    // If no active conversation, create one
    if (!targetConvId || !activeConversation) {
      const newId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: newId,
        title: text ? generateTitleFromPrompt(text) : 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modelId: selectedModel.id,
        messages: []
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newId);
      targetConvId = newId;
      isFirstMessageInConv = true;
    } else if (activeConversation.messages.length === 0) {
      isFirstMessageInConv = true;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments
    };

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === targetConvId) {
          return {
            ...conv,
            title: isFirstMessageInConv && text ? generateTitleFromPrompt(text) : conv.title,
            updatedAt: Date.now(),
            messages: [...conv.messages, userMessage]
          };
        }
        return conv;
      })
    );

    // Prepare assistant message container
    const assistantMessageId = `msg-${Date.now() + 1}-${Math.random().toString(36).substr(2, 5)}`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Add empty assistant message once response generation begins
      let hasAddedAssistantPlaceholder = false;

      const historyMessages = activeConversation?.messages || [];

      await generateAIResponse({
        modelId: selectedModel.name,
        prompt: text,
        history: [...historyMessages, userMessage],
        signal: controller.signal,
        onChunk: (partialChunk) => {
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === targetConvId) {
                if (!hasAddedAssistantPlaceholder) {
                  hasAddedAssistantPlaceholder = true;
                  return {
                    ...conv,
                    updatedAt: Date.now(),
                    messages: [
                      ...conv.messages,
                      { ...initialAssistantMessage, content: partialChunk }
                    ]
                  };
                } else {
                  return {
                    ...conv,
                    updatedAt: Date.now(),
                    messages: conv.messages.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: partialChunk } : m
                    )
                  };
                }
              }
              return conv;
            })
          );
        }
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User stopped generation intentionally
      } else {
        // Show error message
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                updatedAt: Date.now(),
                messages: [
                  ...conv.messages,
                  {
                    id: `msg-${Date.now()}`,
                    role: 'assistant',
                    content: 'An error occurred while generating the response. Please try again.',
                    timestamp: Date.now(),
                    isError: true
                  }
                ]
              };
            }
            return conv;
          })
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (!activeConversation || isLoading) return;

    const messages = activeConversation.messages;
    if (messages.length === 0) return;

    // Find the last user message
    let lastUserMessage: Message | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i];
        break;
      }
    }

    if (!lastUserMessage) return;

    // Pop the last assistant message
    const trimmedMessages = messages.filter((_, idx) => {
      // Remove the last message if it is an assistant message
      return !(idx === messages.length - 1 && messages[idx].role === 'assistant');
    });

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, messages: trimmedMessages, updatedAt: Date.now() }
          : conv
      )
    );

    // Re-generate response
    const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let hasAddedPlaceholder = false;

      await generateAIResponse({
        modelId: selectedModel.name,
        prompt: lastUserMessage.content,
        history: trimmedMessages,
        signal: controller.signal,
        onChunk: (partialChunk) => {
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === activeConversationId) {
                if (!hasAddedPlaceholder) {
                  hasAddedPlaceholder = true;
                  return {
                    ...conv,
                    updatedAt: Date.now(),
                    messages: [
                      ...conv.messages,
                      { ...initialAssistantMessage, content: partialChunk }
                    ]
                  };
                } else {
                  return {
                    ...conv,
                    updatedAt: Date.now(),
                    messages: conv.messages.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: partialChunk } : m
                    )
                  };
                }
              }
              return conv;
            })
          );
        }
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Regenerate error:', err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + N for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        groupedConversations={groupedConversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isMobile={isMobile}
      />

      {/* Main Chat Interface */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Header Bar */}
        <Header
          models={AVAILABLE_MODELS}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />

        {/* Chat Message Thread */}
        <ChatArea
          messages={activeConversation?.messages || []}
          isLoading={isLoading}
          activeModel={selectedModel}
          onSendMessage={(text) => handleSendMessage(text)}
          onRegenerate={handleRegenerate}
        />

        {/* Input Area fixed at bottom */}
        <ChatInput
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        models={AVAILABLE_MODELS}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        onClearAllChats={handleClearAllChats}
      />
    </div>
  );
}
