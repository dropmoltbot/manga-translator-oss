// src/background/index.ts
import browser from 'webextension-polyfill';

console.log('[Background] Service Worker initialized');

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'translate-image',
    title: 'Translate this image',
    contexts: ['image'],
  });
  console.log('[Background] Context menu created');
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate-image' && tab?.id) {
    browser.tabs.sendMessage(tab.id, {
      type: 'TRANSLATE_IMAGE',
      imageUrl: info.srcUrl,
    }).catch((err) => {
      console.error('[Background] Error sending message:', err);
    });
  }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message.type);

  switch (message.type) {
    case 'PING':
      sendResponse({ status: 'pong' });
      break;
    case 'GET_CONFIG':
      browser.storage.local.get([
        'translation_provider',
        'provider_config',
        'source_language',
        'target_language',
      ])
        .then((config) => sendResponse({ config }))
        .catch((err) => sendResponse({ error: err.message }));
      return true;
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  return false;
});

browser.alarms.create('cleanup-cache', { periodInMinutes: 60 });

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup-cache') {
    browser.storage.session.clear().then(() => {
      console.log('[Background] Session cache cleared');
    });
  }
});
