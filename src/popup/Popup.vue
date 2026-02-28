<!-- src/popup/Popup.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { StorageService } from '../shared/storage';
import type { TranslationProvider, ProviderConfig } from '../shared/types';

const activeProvider = ref<TranslationProvider>('openai');
const providerConfig = ref<ProviderConfig>({});
const targetLanguage = ref('en');

const providers: { value: TranslationProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic Claude' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'ollama', label: 'Ollama (Local)' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

onMounted(async () => {
  activeProvider.value = await StorageService.getActiveProvider();
  providerConfig.value = await StorageService.getProviderConfig();
  const langs = await StorageService.getLanguages();
  targetLanguage.value = langs.target;
});

async function saveConfig() {
  await StorageService.setActiveProvider(activeProvider.value);
  await StorageService.setProviderConfig(providerConfig.value);
  await chrome.storage.local.set({ target_language: targetLanguage.value });
  alert('✅ Configuration saved!');
}

function getModelPlaceholder(provider: TranslationProvider): string {
  switch (provider) {
    case 'openai': return 'gpt-4o-mini';
    case 'anthropic': return 'claude-3-5-haiku-20241022';
    case 'openrouter': return 'anthropic/claude-3.5-sonnet';
    case 'ollama': return 'qwen2.5:32b';
    default: return 'model-name';
  }
}
</script>

<template>
  <div class="popup-container">
    <h1 class="title">🌐 Manga Translator</h1>
    
    <div class="form-group">
      <label>Translation Provider</label>
      <select v-model="activeProvider" class="select-input">
        <option v-for="p in providers" :key="p.value" :value="p.value">
          {{ p.label }}
        </option>
      </select>
    </div>

    <div class="form-group" v-if="activeProvider !== 'ollama'">
      <label>API Key</label>
      <input 
        type="password" 
        v-model="providerConfig[activeProvider]!.apiKey" 
        placeholder="sk-..." 
        class="text-input" 
      />
    </div>

    <div class="form-group" v-if="activeProvider === 'ollama'">
      <label>Base URL</label>
      <input 
        type="text" 
        v-model="providerConfig.ollama!.baseUrl" 
        placeholder="http://localhost:11434" 
        class="text-input" 
      />
    </div>

    <div class="form-group">
      <label>Model</label>
      <input 
        type="text" 
        v-model="providerConfig[activeProvider]!.model" 
        :placeholder="getModelPlaceholder(activeProvider)" 
        class="text-input" 
      />
    </div>

    <div class="form-group">
      <label>Target Language</label>
      <select v-model="targetLanguage" class="select-input">
        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>

    <button @click="saveConfig" class="save-btn">💾 Save Configuration</button>
    
    <div class="footer">
      <a href="https://github.com/dropmoltbot/manga-translator-oss" target="_blank">
        📖 Documentation
      </a>
    </div>
  </div>
</template>

<style scoped>
.popup-container {
  width: 360px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #1e293b;
  color: #f1f5f9;
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #cbd5e1;
}
.text-input, .select-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #0f172a;
  color: #f1f5f9;
  font-size: 14px;
}
.text-input:focus, .select-input:focus {
  outline: none;
  border-color: #38bdf8;
}
.save-btn {
  width: 100%;
  padding: 12px;
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:hover {
  background: #0ea5e9;
}
.footer {
  margin-top: 16px;
  text-align: center;
}
.footer a {
  color: #38bdf8;
  text-decoration: none;
  font-size: 14px;
}
.footer a:hover {
  text-decoration: underline;
}
</style>
