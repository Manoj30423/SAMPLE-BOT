import { AIModel } from '../types';

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    badge: 'Flagship',
    description: 'Versatile multimodal intelligence with high speed and precision',
    accentColor: 'text-emerald-500'
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    badge: 'Reasoning',
    description: 'Nuanced thinking, long-form writing, and top-tier coding',
    accentColor: 'text-amber-500'
  },
  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    badge: 'Fast',
    description: 'Blazing low-latency speed with high context multimodal prowess',
    accentColor: 'text-sky-500'
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    badge: 'Pro',
    description: 'Deep complex reasoning, STEM problems, and intricate codebases',
    accentColor: 'text-indigo-500'
  }
];

export const DEFAULT_MODEL_ID = 'gpt-4o';
