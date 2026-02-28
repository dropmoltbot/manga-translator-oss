// src/content/ocr.ts
import { createWorker, type Worker } from 'tesseract.js';
import type { OCRResult } from '../shared/types';

export class OCREngine {
  private worker: Worker | null = null;
  private initialized = false;

  async initialize(language = 'jpn+eng'): Promise<void> {
    if (this.initialized) return;

    console.log('[OCR] Initializing Tesseract worker...');
    this.worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[OCR] Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });
    this.initialized = true;
    console.log('[OCR] Worker ready');
  }

  async recognizeImage(imageUrl: string): Promise<OCRResult> {
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    console.log('[OCR] Recognizing image:', imageUrl);
    const { data } = await this.worker.recognize(imageUrl);

    return {
      text: data.text.trim(),
      confidence: data.confidence,
      language: data.text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/) ? 'ja' : 'en',
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
      console.log('[OCR] Worker terminated');
    }
  }
}

let ocrEngineInstance: OCREngine | null = null;

export function getOCREngine(): OCREngine {
  if (!ocrEngineInstance) {
    ocrEngineInstance = new OCREngine();
  }
  return ocrEngineInstance;
}
