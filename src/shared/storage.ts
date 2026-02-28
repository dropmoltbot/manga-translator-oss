// src/shared/storage.ts
import type { ProviderConfig, TranslationProvider } from './types';
import browser from 'webextension-polyfill';

export class StorageService {
  private static readonly STORAGE_KEYS = {
    PROVIDER: 'translation_provider',
    PROVIDER_CONFIG: 'provider_config',
    SOURCE_LANG: 'source_language',
    TARGET_LANG: 'target_language',
  } as const;

  static async getActiveProvider(): Promise<TranslationProvider> {
    const result = await browser.storage.local.get(this.STORAGE_KEYS.PROVIDER);
    return (result[this.STORAGE_KEYS.PROVIDER] as TranslationProvider) || 'openai';
  }

  static async setActiveProvider(provider: TranslationProvider): Promise<void> {
    await browser.storage.local.set({ [this.STORAGE_KEYS.PROVIDER]: provider });
  }

  static async getProviderConfig(): Promise<ProviderConfig> {
    const result = await browser.storage.local.get(this.STORAGE_KEYS.PROVIDER_CONFIG);
    return (result[this.STORAGE_KEYS.PROVIDER_CONFIG] as ProviderConfig) || {};
  }

  static async setProviderConfig(config: ProviderConfig): Promise<void> {
    await browser.storage.local.set({ [this.STORAGE_KEYS.PROVIDER_CONFIG]: config });
  }

  static async getLanguages(): Promise<{ source: string; target: string }> {
    const result = await browser.storage.local.get([
      this.STORAGE_KEYS.SOURCE_LANG,
      this.STORAGE_KEYS.TARGET_LANG,
    ]);
    return {
      source: (result[this.STORAGE_KEYS.SOURCE_LANG] as string) || 'auto',
      target: (result[this.STORAGE_KEYS.TARGET_LANG] as string) || 'en',
    };
  }
}
