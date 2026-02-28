// src/shared/translator.ts
import type { TranslationConfig, TranslationResult } from './types';

export class TranslationService {
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
  }

  async translate(text: string): Promise<TranslationResult> {
    switch (this.config.provider) {
      case 'openai':
        return this.translateOpenAI(text);
      case 'anthropic':
        return this.translateAnthropic(text);
      case 'openrouter':
        return this.translateOpenRouter(text);
      case 'ollama':
        return this.translateOllama(text);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async translateOpenAI(text: string): Promise<TranslationResult> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are a professional manga translator. Translate from ${this.config.sourceLanguage} to ${this.config.targetLanguage}. Output ONLY the translation.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      originalText: text,
      translatedText: data.choices[0].message.content.trim(),
      provider: 'openai',
      model: this.config.model,
    };
  }

  private async translateAnthropic(text: string): Promise<TranslationResult> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Translate this manga text from ${this.config.sourceLanguage} to ${this.config.targetLanguage}. Output ONLY the translation:\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      originalText: text,
      translatedText: data.content[0].text.trim(),
      provider: 'anthropic',
      model: this.config.model,
    };
  }

  private async translateOpenRouter(text: string): Promise<TranslationResult> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://github.com/dropmoltbot/manga-translator-oss',
        'X-Title': 'Manga Translator OSS',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are a professional manga translator. Translate from ${this.config.sourceLanguage} to ${this.config.targetLanguage}. Output ONLY the translation.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      originalText: text,
      translatedText: data.choices[0].message.content.trim(),
      provider: 'openrouter',
      model: this.config.model,
    };
  }

  private async translateOllama(text: string): Promise<TranslationResult> {
    if (!this.config.baseUrl) {
      throw new Error('Ollama base URL not configured');
    }

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `Translate manga text from ${this.config.sourceLanguage} to ${this.config.targetLanguage}. Output ONLY translation.`,
          },
          { role: 'user', content: text },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      originalText: text,
      translatedText: data.message.content.trim(),
      provider: 'ollama',
      model: this.config.model,
    };
  }
}
