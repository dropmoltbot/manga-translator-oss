// src/content/ui.ts
import DOMPurify from 'dompurify';

export class TranslationUI {
  private shadowRoot: ShadowRoot | null = null;
  private overlayContainer: HTMLElement | null = null;

  createOverlay(targetImage: HTMLImageElement, translatedText: string): void {
    this.destroy();

    const container = document.createElement('div');
    container.id = 'manga-translator-overlay';
    document.body.appendChild(container);

    this.shadowRoot = container.attachShadow({ mode: 'closed' });
    this.overlayContainer = container;

    const rect = targetImage.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const styles = `
      :host { all: initial; }
      .overlay-box {
        position: absolute;
        left: ${rect.left + scrollX}px;
        top: ${rect.top + scrollY}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        background: rgba(0, 0, 0, 0.85);
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 16px;
        line-height: 1.6;
        padding: 20px;
        box-sizing: border-box;
        z-index: 2147483647;
        overflow-y: auto;
        border: 2px solid #38bdf8;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
      .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.2s;
      }
      .close-btn:hover { background: #dc2626; }
      .translation-text {
        margin-top: 40px;
        white-space: pre-wrap;
        word-break: break-word;
      }
    `;

    const sanitizedText = DOMPurify.sanitize(translatedText, {
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true,
    });

    const template = `
      <style>${styles}</style>
      <div class="overlay-box">
        <button class="close-btn" id="close-overlay">✕ Close</button>
        <div class="translation-text">${sanitizedText}</div>
      </div>
    `;

    this.shadowRoot.innerHTML = template;

    const closeBtn = this.shadowRoot.getElementById('close-overlay');
    closeBtn?.addEventListener('click', () => this.destroy());

    document.addEventListener('click', this.handleOutsideClick.bind(this), { once: true });
  }

  private handleOutsideClick(event: MouseEvent): void {
    if (this.overlayContainer && !this.overlayContainer.contains(event.target as Node)) {
      this.destroy();
    }
  }

  destroy(): void {
    if (this.overlayContainer) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
      this.shadowRoot = null;
    }
  }

  showLoadingIndicator(targetImage: HTMLImageElement): void {
    const rect = targetImage.getBoundingClientRect();
    const loader = document.createElement('div');
    loader.id = 'manga-translator-loader';
    loader.style.cssText = `
      position: absolute;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      z-index: 2147483646;
      border-radius: 8px;
    `;
    loader.textContent = '⏳ Translating...';
    document.body.appendChild(loader);
  }

  hideLoadingIndicator(): void {
    const loader = document.getElementById('manga-translator-loader');
    loader?.remove();
  }

  showError(message: string): void {
    alert(`Translation Error: ${message}`);
  }
}
