import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  X,
  Square,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { MessageAttachment } from '../types';

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (text: string, attachments?: MessageAttachment[]) => void;
  onStopGeneration?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  isLoading,
  onSendMessage,
  onStopGeneration,
  disabled = false
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea as content expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap at 200px max height, then native scroll takes over
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [inputText]);

  // Handle keypress: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if ((trimmed || attachments.length > 0) && !isLoading && !disabled) {
      onSendMessage(trimmed, attachments);
      setInputText('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: MessageAttachment[] = Array.from(files).map((file) => {
      const sizeInKb = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${sizeInKb} KB`;

      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: sizeStr,
        type: file.type || 'file'
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Rough estimation: ~4 chars per token for typical English text
  const charCount = inputText.length;
  const approxTokens = Math.ceil(charCount / 4);
  const canSend = (charCount > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="w-full bg-linear-to-t from-zinc-50 via-zinc-50/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 dark:to-transparent pt-4 pb-5 px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Container for input box */}
        <div className="relative rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-400/20 dark:focus-within:ring-zinc-600/20 transition-all">
          {/* Attachment preview pills */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3.5 pt-3 pb-1 border-b border-zinc-100 dark:border-zinc-800">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                >
                  {att.type.startsWith('image/') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                  <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                  <span className="text-[10px] text-zinc-400">({att.size})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors ml-0.5"
                    title="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Area */}
          <div className="px-3.5 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask anything... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-transparent resize-none outline-hidden text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 leading-relaxed max-h-[200px]"
            />
          </div>

          {/* Action Bar (Upload icon, token count, send button) */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1">
            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Add attachment (files, images)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Character & Token count indicator */}
              {charCount > 0 && (
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  {charCount} chars • ~{approxTokens} tokens
                </span>
              )}
            </div>

            {/* Send or Stop Generation button */}
            <div className="flex items-center gap-2">
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-all flex items-center gap-1 text-xs font-medium px-2.5"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className={`p-2 rounded-xl transition-all ${
                    canSend
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm hover:scale-105 active:scale-95 cursor-pointer'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                  title={canSend ? 'Send message' : 'Type a message to send'}
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
          AI models may make mistakes. Verify critical facts and information.
        </p>
      </div>
    </div>
  );
};
