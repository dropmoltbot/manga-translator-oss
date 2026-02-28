// src/content/index.ts
import browser from 'webextension-polyfill';
import { getOCREngine } from './ocr';
import { TranslationUI } from './ui';
import { TranslationService } from '../shared/translator';
import { StorageService } from '../shared/storage';
import type { TranslationConfig } from '../shared/types';

console.log('[Content] Manga Translator OSS loaded');

const ui = new TranslationUI();

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'TRANSLATE_IMAGE') {
    await handleTranslateImage(message.imageUrl);
  }
});

async function handleTranslateImage(imageUrl: string): Promise<void> {
  try {
    const targetImage = Array.from(document.querySelectorAll('img')).find(
      (img) => img.src === imageUrl || img.currentSrc === imageUrl
    );

    if (!targetImage) {
      throw new Error('Image not found on page');
    }

    ui.showLoadingIndicator(targetImage);

    // Step 1: OCR
    const ocrEngine = getOCREngine();
    await ocrEngine.initialize('jpn+eng');
    const ocrResult = await ocrEngine.recognizeImage(imageUrl);
    console.log('[Content] OCR Result:', ocrResult);

    if (!ocrResult.text || ocrResult.text.length < 2) {
      throw new Error('No text detected in image');
    }

    // Step 2: Get translation config
    const provider = await StorageService.getActiveProvider();
    const providerConfig = await StorageService.getProviderConfig();
    const languages = await StorageService.getLanguages();
    const config = providerConfig[provider];

    if (!config) {
      throw new Error(`${provider} not configured. Please set API key in extension options.`);
    }

    const translationConfig: TranslationConfig = {
      provider,
      apiKey: 'apiKey' in config ? config.apiKey : undefined,
      baseUrl: 'baseUrl' in config ? config.baseUrl : undefined,
      model: config.model,
      sourceLanguage: languages.source as 'auto' | 'ja' | 'ko' | 'zh',
      targetLanguage: languages.target,
    };

    // Step 3: Translate
    const translator = new TranslationService(translationConfig);
    const translationResult = await translator.translate(ocrResult.text);
    console.log('[Content] Translation Result:', translationResult);

    // Step 4: Display
    ui.hideLoadingIndicator();
    ui.createOverlay(targetImage, translationResult.translatedText);

    // Cache in session storage
    await browser.storage.session.set({
      [`ocr_cache_${imageUrl}`]: {
        ocr: ocrResult,
        translation: translationResult,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    ui.hideLoadingIndicator();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    ui.showError(errorMessage);
    console.error('[Content] Translation error:', error);
  }
}

window.addEventListener('beforeunload', () => {
  ui.destroy();
});
