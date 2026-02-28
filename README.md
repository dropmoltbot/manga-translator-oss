# 🌐 Manga Translator OSS

**Privacy-first, open-source manga/manhwa/manhua translator browser extension with local OCR and configurable translation APIs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Features

- 🔒 **100% Privacy-First**: No telemetry, no tracking, no data collection
- 🧠 **Local OCR**: Tesseract.js WASM runs entirely in your browser
- 🌍 **Multi-Provider Translation**: OpenAI, Anthropic, OpenRouter, Ollama, DeepL
- 🎨 **Clean UI**: Shadow DOM isolation prevents CSS conflicts
- ⚡ **Manifest V3**: Modern, secure, and ephemeral service workers
- 🆓 **Zero Server Costs**: Bring your own API keys, no subscription

---

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone the repository**
```bash
git clone https://github.com/dropmoltbot/manga-translator-oss.git
cd manga-translator-oss
```

2. **Load in Chrome/Edge/Brave**
```
Open chrome://extensions
Enable "Developer mode"
Click "Load unpacked"
Select the project folder
```

### ⚙️ Configuration

1. **Get API Keys**

| Provider | Get Key | Cost | Best For |
|----------|---------|------|----------|
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | $0.14-$3/1M tokens | Best value, 200+ models |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | $0.15-$5/1M tokens | High quality |
| DeepL | [deepl.com/pro-api](https://www.deepl.com/pro-api) | $0.20-$2.50/1M tokens | Best European languages |
| Ollama | [ollama.com](https://ollama.com) | Free (local) | 100% offline |

2. **Configure Extension**

Click the extension icon → Enter:
- **Provider**: Choose your translation API
- **API Key**: Paste your key (stored locally, encrypted by Chrome)
- **Model**: Recommended models:
  - OpenRouter: `anthropic/claude-3.5-sonnet` or `qwen/qwen-2.5-72b-instruct`
  - OpenAI: `gpt-4o-mini`
  - DeepL: `DeepL-Auth-Key`
- **Target Language**: English, Français, Español, etc.

### 📖 Usage

**Method 1: Click on Image**
1. Visit any manga/webtoon site
2. Click 🗡️ on any image
3. Wait for OCR + Translation (5-10 seconds)

**Method 2: Auto-Detect**
Enable auto-detect in settings → Images are automatically processed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│ User clicks image                          │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ Content Script (content.js)                │
│ - Detects image                            │
│ - Shows loading indicator                  │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ OCR Engine (Tesseract.js WASM)             │
│ - Recognizes Japanese/Korean/Chinese text  │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ Translation Service                        │
│ - Calls configured API (OpenRouter/etc.)   │
│ - Returns translated text                  │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│ UI Layer                                    │
│ - Overlay popup (CSS isolated)             │
│ - Displays translation                      │
└─────────────────────────────────────────────┘
```

---

## 🛡️ Privacy Guarantees

This extension is designed with privacy-absolutism:

- ✅ Zero telemetry - No analytics, no tracking pixels
- ✅ Zero remote code execution - All logic runs locally
- ✅ Zero data collection - We never see your API keys or images
- ✅ Minimal permissions - Only `storage`, `activeTab`, `scripting`
- ✅ Open source - Audit the entire codebase yourself

**What data leaves your browser?**

Only the OCR-extracted text is sent to your configured translation API. Your API provider (OpenAI/Anthropic/etc.) may log requests per their policy. For 100% offline usage, use Ollama with local models.

---

## 📦 Project Structure

```
manga-translator-oss/
├── src/
│   ├── background/       # Service worker (V3)
│   ├── content/         # Content scripts (OCR, UI)
│   ├── popup/           # Extension popup
│   └── shared/          # Shared utilities
├── .github/
│   └── workflows/       # CI/CD automation
├── manifest.json        # Chrome Extension manifest
└── README.md           # This file
```

---

## 🤝 Contributing

Contributions are welcome!

Areas needing help:
- Firefox compatibility testing
- Safari extension port
- UI/UX improvements
- Support for more OCR languages (Korean, Chinese)
- Manga-OCR ONNX integration (higher accuracy)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- Inspired by Fakey Manga Translator
