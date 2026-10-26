self.addEventListener('install', (e) => {
  console.log('[Service Worker] تم تثبيت الخدمة');
});

self.addEventListener('fetch', (e) => {
  // للتعامل مع الطلبات محلياً
});