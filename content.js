// Arise Translator Pro v5.0 - Solo Leveling Theme
(function() {
  'use strict';
  
  console.log('[Arise Pro v5 🐉] Initializing... Solo Leveling mode.');
  
  const config = {
    targetLang: 'en',
    provider: 'local',
    apiKey: '',
    autoDetect: true,
    showOverlay: true
  };
  
  const processedImages = new WeakSet();
  let tesseractWorker = null;
  let widget = null;
  
  function getStorage(key) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(key).then(resolve).catch(() => resolve({}));
      } else {
        resolve({});
      }
    });
  }
  
  function setStorage(obj) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set(obj).then(resolve).catch(() => resolve());
      } else {
        resolve();
      }
    });
  }
  
  getStorage(['targetLang', 'provider', 'apiKey', 'autoDetect', 'showOverlay']).then(s => {
    Object.assign(config, s);
    console.log('[Arise Pro v5 🐉] Config loaded:', config);
    if (config.autoDetect) initAutoOCR();
    createWidget();
  });
  
  async function initTesseract() {
    if (tesseractWorker) return tesseractWorker;
    
    console.log('[Arise 🐉] Loading Tesseract.js...');
    try {
      const Tesseract = await import('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js');
      tesseractWorker = await Tesseract.createWorker('eng+jpn+kor+chi_sim+chi_tra+tha');
      console.log('[Arise 🐉] Tesseract ready! I alone am the strongest.');
      return tesseractWorker;
    } catch (e) {
      console.error('[Arise 🐉] Tesseract error:', e);
      return null;
    }
  }
  
  function initAutoOCR() {
    console.log('[Arise 🐉] Starting auto OCR...');
    document.querySelectorAll('img').forEach(img => processImage(img));
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG') setTimeout(() => processImage(node), 500);
            node.querySelectorAll?.('img').forEach(img => setTimeout(() => processImage(img), 500));
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  function processImage(img) {
    if (!config.showOverlay) return;
    if (processedImages.has(img)) return;
    if (img.naturalWidth < 100 || img.naturalHeight < 50) return;
    if (!img.complete) { img.addEventListener('load', () => processImage(img)); return; }
    
    processedImages.add(img);
    createOverlay(img);
  }
  
  function createOverlay(img) {
    const rect = img.getBoundingClientRect();
    if (rect.width < 80) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'arise-overlay-btn';
    overlay.innerHTML = '📖';
    overlay.title = 'ARISE - I alone am the strongest';
    overlay.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: linear-gradient(135deg,#8B0000,#4a0000);
      color: #FFD700;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2147483647;
      font-size: 18px;
      box-shadow: 0 4px 15px rgba(139, 0, 0, 0.6), 0 0 10px rgba(255, 215, 0, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid #FFD700;
    `;
    
    overlay.addEventListener('mouseenter', () => {
      overlay.style.transform = 'scale(1.15)';
      overlay.style.boxShadow = '0 6px 25px rgba(139, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5)';
    });
    overlay.addEventListener('mouseleave', () => {
      overlay.style.transform = 'scale(1)';
      overlay.style.boxShadow = '0 4px 15px rgba(139, 0, 0, 0.6), 0 0 10px rgba(255, 215, 0, 0.3)';
    });
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: relative; display: inline-block;';
    
    try {
      if (img.parentElement && img.parentElement.style.position !== 'absolute') {
        img.parentElement.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        wrapper.appendChild(overlay);
      } else { return; }
    } catch(e) { return; }
    
    overlay.addEventListener('click', async (e) => {
      e.stopPropagation();
      await translateImage(img, overlay);
    });
  }
  
  async function translateImage(img, overlay) {
    overlay.innerHTML = '⏳';
    overlay.style.pointerEvents = 'none';
    
    try {
      const worker = await initTesseract();
      if (!worker) { showNotification('❌ OCR failed', 'error'); overlay.innerHTML = '❌'; return; }
      
      const { data: { text, confidence } } = await worker.recognize(img);
      if (!text || text.trim().length < 2) {
        showNotification('❌ No text detected', 'error');
        overlay.innerHTML = '❌';
        setTimeout(() => { overlay.innerHTML = '📖'; overlay.style.pointerEvents = 'auto'; }, 2000);
        return;
      }
      
      const translated = await translateText(text, config.targetLang);
      showTranslationPopup(img, text, translated, confidence);
      overlay.innerHTML = '✅';
      setTimeout(() => { overlay.innerHTML = '📖'; overlay.style.pointerEvents = 'auto'; }, 3000);
      
    } catch (err) {
      console.error('[Arise 🐉] Error:', err);
      showNotification('❌ Error: ' + err.message, 'error');
      overlay.innerHTML = '❌';
      setTimeout(() => { overlay.innerHTML = '📖'; overlay.style.pointerEvents = 'auto'; }, 3000);
    }
  }
  
  async function translateText(text, lang) {
    const cleanText = text.trim().substring(0, 1500);
    if (config.provider === 'local' || !config.apiKey) return `[${lang.toUpperCase()}] ${cleanText}`;
    if (config.provider === 'openrouter') return translateOpenRouter(cleanText, lang);
    if (config.provider === 'deepl') return translateDeepL(cleanText, lang);
    return cleanText;
  }
  
  async function translateOpenRouter(text, lang) {
    const langMap = { en: 'English', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', fr: 'French', de: 'German', es: 'Spanish' };
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'chrome-extension://arise-translator' },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'system', content: `You are a professional manga translator. Translate to ${langMap[lang] || 'English'}.` }, { role: 'user', content: text }]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || text;
  }
  
  async function translateDeepL(text, lang) {
    const langCode = { en: 'EN', ja: 'JA', ko: 'KO', zh: 'ZH', fr: 'FR', de: 'DE', es: 'ES' };
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Authorization': `DeepL-Auth-Key ${config.apiKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(text)}&target_lang=${langCode[lang] || 'EN'}`
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.translations?.[0]?.text || text;
  }
  
  function showTranslationPopup(img, original, translated, confidence) {
    document.querySelectorAll('.arise-translation-popup').forEach(el => el.remove());
    
    const popup = document.createElement('div');
    popup.className = 'arise-translation-popup';
    popup.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      background: rgba(10, 10, 10, 0.95);
      color: #fff;
      padding: 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      z-index: 2147483646;
      max-height: 280px;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(139, 0, 0, 0.4);
      border: 2px solid #FFD700;
      font-family: 'Noto Sans', 'Segoe UI', system-ui, sans-serif;
    `;
    
    const confPercent = confidence ? Math.round(confidence) : '?';
    
    popup.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="font-size:14px;color:#FFD700;font-weight:700;">📖 ARISE <span style="font-size:10px;color:#8B0000;">SOLO LEVELING</span></span>
        <span style="font-size:10px;color:#666;">OCR: ${confPercent}%</span>
      </div>
      <div style="background:linear-gradient(135deg,rgba(139,0,0,0.2),rgba(255,215,0,0.1));padding:12px;border-radius:10px;margin-bottom:12px;border:1px solid #8B0000;">
        <div style="font-size:11px;color:#FFD700;margin-bottom:4px;">TRANSLATION</div>
        <div>${translated}</div>
      </div>
      <div style="font-size:10px;color:#444;border-top:1px solid #333;padding-top:10px;">
        <div style="margin-bottom:4px;">📝 Original (${original.length} chars):</div>
        <div style="color:#666;word-break:break-word;">${original.substring(0, 200)}${original.length > 200 ? '...' : ''}</div>
      </div>
      <button class="arise-close-popup" style="position:absolute;top:10px;right:10px;background:none;border:none;color:#FFD700;cursor:pointer;font-size:20px;line-height:1;">×</button>
    `;
    
    const wrapper = img.closest('div[style*="position: relative"]');
    if (wrapper) {
      wrapper.appendChild(popup);
      popup.querySelector('.arise-close-popup').addEventListener('click', () => popup.remove());
      setTimeout(() => popup.remove(), 20000);
    }
  }
  
  function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 14px 20px;
      background: linear-gradient(135deg,#8B0000,#4a0000);
      color: #FFD700;
      border-radius: 10px;
      font-size: 13px;
      z-index: 2147483647;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 15px rgba(255, 215, 0, 0.3);
      animation: ariseSlideIn 0.3s ease;
      border: 1px solid #FFD700;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
  }
  
  function createWidget() {
    if (document.getElementById('arise-widget')) return;
    
    widget = document.createElement('div');
    widget.id = 'arise-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 280px;
      padding: 18px;
      background: linear-gradient(180deg, #0a0a0a, #1a0a0a);
      border: 2px solid #8B0000;
      border-radius: 16px;
      color: #fff;
      font-family: 'Noto Sans', system-ui, sans-serif;
      z-index: 9999999;
      box-shadow: 0 12px 40px rgba(139, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.1);
    `;
    
    widget.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <span style="font-weight:700;font-size:16px;color:#FFD700;">📖 ARISE <span style="font-size:10px;color:#8B0000;">SOLO</span></span>
        <button id="arise-close" style="background:none;border:none;color:#FFD700;cursor:pointer;font-size:20px;line-height:1;">×</button>
      </div>
      <div style="font-size:11px;color:#777;margin-bottom:14px;line-height:1.5;">
        Click any image to translate! "I alone am the strongest."
      </div>
      <select id="arise-lang" style="width:100%;padding:10px;background:rgba(20,0,0,0.8);border:1px solid #8B0000;border-radius:10px;color:#fff;margin-bottom:10px;font-size:12px;">
        <option value="en">🇺🇸 English</option>
        <option value="ja">🇯🇵 Japanese</option>
        <option value="ko">🇰🇷 Korean</option>
        <option value="zh">🇨🇳 Chinese</option>
        <option value="fr">🇫🇷 French</option>
        <option value="de">🇩🇪 German</option>
        <option value="es">🇪🇸 Spanish</option>
      </select>
      <div style="display:flex;gap:8px;">
        <button id="arise-scan" style="flex:1;padding:12px;background:linear-gradient(135deg,#8B0000,#4a0000);border:1px solid #FFD700;border-radius:10px;color:#FFD700;font-weight:600;cursor:pointer;font-size:12px;">
          🔍 SCAN
        </button>
        <button id="arise-translate-all" style="flex:1;padding:12px;background:linear-gradient(135deg,#FFD700,#B8860B);border:none;border-radius:10px;color:#000;font-weight:700;cursor:pointer;font-size:12px;">
          📖 ALL
        </button>
      </div>
    `;
    
    document.body.appendChild(widget);
    document.getElementById('arise-close').onclick = () => widget.remove();
    document.getElementById('arise-lang').value = config.targetLang;
    document.getElementById('arise-lang').onchange = (e) => { config.targetLang = e.target.value; setStorage({ targetLang: e.target.value }); };
    
    document.getElementById('arise-scan').onclick = () => {
      let count = 0;
      document.querySelectorAll('img').forEach(img => { if (img.naturalWidth > 100 && img.naturalHeight > 50) { processImage(img); count++; } });
      showNotification(`Found ${count} images! Click 📖`);
    };
    
    document.getElementById('arise-translate-all').onclick = async () => {
      const images = Array.from(document.querySelectorAll('img')).filter(img => img.naturalWidth > 100 && img.naturalHeight > 50);
      if (images.length === 0) { showNotification('No images!', 'error'); return; }
      showNotification(`Translating ${images.length} images...`);
      for (const img of images.slice(0, 10)) { processImage(img); await new Promise(r => setTimeout(r, 500)); }
      showNotification('Ready! Click 📖 on images.');
    };
  }
  
  const style = document.createElement('style');
  style.textContent = `@keyframes ariseSlideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
  document.head.appendChild(style);
  
  console.log('[Arise Pro v5 🐉] Ready! I alone am the strongest.');
})();
