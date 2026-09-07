import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Code2, Compass, MessageSquareCode, Sparkles, Lightbulb } from 'lucide-react';
import { Message, AIModel } from '../types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  activeModel: AIModel;
  onSendMessage: (text: string) => void;
  onRegenerate: () => void;
}

const STARTER_PROMPTS = [
  {
    icon: Code2,
    title: 'Code Architecture',
    prompt: 'Write a TypeScript custom hook for responsive window breakpoints and explain best practices.'
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm Solutions',
    prompt: 'Compare PostgreSQL indexing strategies (B-Tree vs GIN vs BRIN) with practical examples.'
  },
  {
    icon: MessageSquareCode,
    title: 'Draft a Professional Email',
    prompt: 'Draft a polite follow-up email to a client requesting feedback on our latest design proposal.'
  },
  {
    icon: Compass,
    title: 'Explain Complex Topics',
    prompt: 'Explain how Large Language Models use attention mechanisms in simple, visual terms.'
  }
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  activeModel,
  onSendMessage,
  onRegenerate
}) => {
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll on new message or streaming
  useEffect(() => {
    if (!showScrollBottom) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showScrollBottom]);

  // Track if user scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 120);
  };

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  // Find index of the last assistant message
  const lastAssistantIndex = messages
    .map((m, idx) => ({ role: m.role, idx }))
    .filter((item) => item.role === 'assistant')
    .pop()?.idx;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col justify-between"
    >
      {messages.length === 0 ? (
        // Empty State: Modern Minimalist Welcome with Starter Prompts
        <div className="my-auto max-w-2xl mx-auto w-full py-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shadow-xs mb-4">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            How can I help you today?
          </h2>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
            Powered by <span className="font-semibold text-zinc-800 dark:text-zinc-200">{activeModel.name}</span>.
            Choose a starter below or type your question.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
            {STARTER_PROMPTS.map((starter, i) => {
              const Icon = starter.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSendMessage(starter.prompt)}
                  className="group p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {starter.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {starter.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Message thread
        <div className="max-w-3xl mx-auto w-full space-y-3">
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLast={index === lastAssistantIndex}
              isLoading={isLoading}
              modelName={activeModel.name}
              onRegenerate={onRegenerate}
            />
          ))}

          {/* Typing Indicator while waiting for first chunk or while loading */}
          {isLoading && (
            <TypingIndicator modelName={activeModel.name} />
          )}

          <div ref={bottomAnchorRef} className="h-4" />
        </div>
      )}

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-30 p-2.5 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all focus:outline-hidden"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
