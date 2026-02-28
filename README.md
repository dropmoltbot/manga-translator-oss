# 🌐 Manga Translator OSS

**Privacy-first, open-source manga/manhwa/manhua translator browser extension with local OCR and configurable translation APIs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Features

- 🔒 **100% Privacy-First**: No telemetry, no tracking, no data collection
- 🧠 **Local OCR**: Tesseract.js WASM runs entirely in your browser
- 🌍 **Multi-Provider Translation**: OpenAI, Anthropic, OpenRouter, Ollama
- 🎨 **Clean UI**: Shadow DOM isolation prevents CSS conflicts
- ⚡ **Manifest V3**: Modern, secure, and ephemeral service workers
- 🆓 **Zero Server Costs**: Bring your own API keys, no subscription

---

## 🚀 Installation

### From Source (Developer Mode)

```bash
git clone https://github.com/dropmoltbot/manga-translator-oss.git
cd manga-translator-oss
pnpm install
pnpm build
```

Then load in Chrome:
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

### ⚙️ Configuration

1. **Get API Keys**

| Provider | Get Key | Cost | Best For |
|----------|---------|------|----------|
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | $0.14-$3/1M tokens | Best value, 200+ models |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | $0.15-$5/1M tokens | High quality |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) | $3-$15/1M tokens | Best accuracy |
| Ollama | [ollama.com](https://ollama.com) | Free (local) | 100% offline |

2. **Configure Extension**
Click the extension icon → Enter your API key and select your provider.

---

## 🏗️ Architecture

```
User clicks image → Content Script detects
        ↓
OCR (Tesseract.js WASM)
        ↓
Translation API (OpenAI/Anthropic/OpenRouter/Ollama)
        ↓
Shadow DOM overlay (CSS isolated)
```

---

## 🛡️ Privacy Guarantees

- ✅ Zero telemetry - No analytics
- ✅ Zero remote code execution - All logic runs locally
- ✅ Zero data collection - API keys stay on your device
- ✅ Minimal permissions - Only `activeTab`, `storage`, `contextMenus`

---

## 📦 Project Structure

```
manga-translator-oss/
├── src/
│   ├── background/    # Service Worker
│   ├── content/      # OCR & UI
│   ├── popup/        # Vue popup config
│   ├── options/      # Vue options page
│   └── shared/       # Types, Storage, Translator
├── .github/workflows/
└── package.json
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill) - Cross-browser compatibility
