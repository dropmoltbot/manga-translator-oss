// Arise Translator Pro v5.0 - Solo Leveling Theme
// "I alone am the strongest."
console.log('[Arise Pro v5 🐉] Background service worker loaded - Solo Leveling mode.');

function safeSetStorage(obj) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set(obj).catch(() => {});
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Arise 🐉] Extension installed');
  safeSetStorage({
    targetLang: 'en',
    provider: 'local',
    apiKey: '',
    autoDetect: true,
    showOverlay: true
  });
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === 'translate') {
    translate(req.text, req.lang, req.provider, req.apiKey)
      .then(r => sendResponse({ success: true, result: r }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
  
  if (req.action === 'getConfig') {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['targetLang', 'provider', 'apiKey', 'autoDetect', 'showOverlay'])
        .then(s => sendResponse({ success: true, config: s }))
        .catch(e => sendResponse({ success: false, error: e.message }));
    } else {
      sendResponse({ success: false, error: 'Storage not available' });
    }
    return true;
  }
});

async function translate(text, lang, provider, apiKey) {
  const cleanText = text.trim().substring(0, 1500);
  if (!apiKey || provider === 'local') return `[${lang.toUpperCase()}] ${cleanText}`;
  if (provider === 'openrouter') return translateOpenRouter(cleanText, lang, apiKey);
  if (provider === 'deepl') return translateDeepL(cleanText, lang, apiKey);
  return cleanText;
}

async function translateOpenRouter(text, lang, apiKey) {
  const langMap = { en: 'English', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', fr: 'French', de: 'German', es: 'Spanish', pt: 'Portuguese', ru: 'Russian', it: 'Italian' };
  
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'chrome-extension://arise-translator' },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'system', content: `You are a professional manga translator. Translate to ${langMap[lang] || 'English'}.` }, { role: 'user', content: text }]
    })
  });
  
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || text;
}

async function translateDeepL(text, lang, apiKey) {
  const langCode = { en: 'EN-US', ja: 'JA', ko: 'KO', zh: 'ZH', fr: 'FR', de: 'DE', es: 'ES', pt: 'PT', ru: 'RU', it: 'IT' };
  
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Authorization': `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `text=${encodeURIComponent(text)}&target_lang=${langCode[lang] || 'EN-US'}`
  });
  
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.translations?.[0]?.text || text;
}
