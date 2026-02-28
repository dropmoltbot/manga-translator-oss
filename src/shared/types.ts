// src/shared/types.ts
export type TranslationProvider = 'openai' | 'anthropic' | 'openrouter' | 'ollama';

export interface TranslationConfig {
  provider: TranslationProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  sourceLanguage: 'auto' | 'ja' | 'ko' | 'zh';
  targetLanguage: string;
}

export interface ProviderConfig {
  openai?: { apiKey: string; model: string };
  anthropic?: { apiKey: string; model: string };
  openrouter?: { apiKey: string; model: string };
  ollama?: { baseUrl: string; model: string };
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  provider: TranslationProvider;
  model: string;
}
