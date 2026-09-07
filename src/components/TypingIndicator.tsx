import React from 'react';
import { Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  modelName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ modelName = 'AI' }) => {
  return (
    <div id="typing-indicator" className="w-full py-2.5 flex justify-start">
      <div className="flex gap-3 max-w-[85%] items-start">
        {/* Model Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-xs flex-shrink-0 mt-0.5 animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {modelName}
            </span>
            <span className="text-[11px] text-zinc-400">thinking...</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
