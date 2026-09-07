import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  User,
  Bot,
  FileText,
  Terminal
} from 'lucide-react';
import { Message } from '../types';
import { formatTimestamp, formatDateFull } from '../utils/dateGrouping';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
  modelName?: string;
  onRegenerate?: () => void;
}

// Code block component with copy button and language pill
function CodeBlock({
  node: _node,
  inline,
  className,
  children,
  ...props
}: any) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-mono uppercase tracking-wide text-[11px] font-semibold">
            {language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-zinc-950 text-zinc-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast,
  isLoading,
  modelName = 'AI',
  onRegenerate
}) => {
  const isUser = message.role === 'user';
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleCopyFullMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      setCopiedMessage(false);
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group w-full py-2.5 transition-colors ${
        isUser ? 'flex justify-end' : 'flex justify-start'
      }`}
    >
      <div
        className={`flex gap-3 max-w-[88%] sm:max-w-[80%] md:max-w-[75%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div
              className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 flex items-center justify-center font-medium text-xs shadow-xs"
              title="You"
            >
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-xs"
              title={modelName}
            >
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Bubble & content */}
        <div className="flex flex-col space-y-1 min-w-0">
          {/* Sender label for AI */}
          {!isUser && (
            <div className="flex items-center gap-1.5 px-0.5">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {modelName}
              </span>
              <span className="text-[11px] text-zinc-400">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          )}

          {/* User Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1 justify-end">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <span className="text-[10px] text-zinc-400">({att.size})</span>
                </div>
              ))}
            </div>
          )}

          {/* Message Bubble Container */}
          <div
            className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
              isUser
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-sm shadow-xs'
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : (
              <div className="markdown-body prose dark:prose-invert max-w-none text-sm leading-relaxed break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock,
                    p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 mb-2.5 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 mb-2.5 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-3 border-indigo-500 pl-3.5 py-0.5 my-2.5 text-zinc-600 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/60 rounded-r-md">
                        {children}
                      </blockquote>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-4 mb-2 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-2.5 mb-1">
                        {children}
                      </h3>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:opacity-80"
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div className="my-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <table className="w-full text-left text-xs border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => <th className="px-3.5 py-2">{children}</th>,
                    td: ({ children }) => <td className="px-3.5 py-2">{children}</td>,
                    hr: () => (
                      <hr className="my-4 border-zinc-200 dark:border-zinc-800" />
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Bottom Bar: subtle timestamp on hover + action buttons */}
          <div
            className={`flex items-center gap-2 pt-0.5 px-1 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Timestamp shown subtly, full date on hover */}
            <span
              className="text-[11px] text-zinc-400 dark:text-zinc-500 opacity-60 group-hover:opacity-100 transition-opacity"
              title={formatDateFull(message.timestamp)}
            >
              {isUser && formatTimestamp(message.timestamp)}
            </span>

            {/* AI message actions: Copy & Regenerate */}
            {!isUser && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleCopyFullMessage}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Copy message"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Regenerate button only on the last AI message */}
                {isLast && !isLoading && onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
