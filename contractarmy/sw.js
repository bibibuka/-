/* Service worker для статической копии страницы.
   Превращает абсолютные пути Next.js (/_next/…, /images/…, /_next/image)
   в локальные файлы внутри папки копии. */
const BASE = new URL(self.location.href).pathname.replace(/\/sw\.js$/, '');

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === BASE || url.pathname.startsWith(BASE + '/')) return;

  let target = null;

  if (url.pathname === '/_next/image') {
    const src = url.searchParams.get('url') || '';
    if (src.charAt(0) === '/') target = BASE + src.split('?')[0];
  } else if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/favicon-96x96.png' ||
    url.pathname === '/apple-touch-icon.png' ||
    url.pathname === '/site.webmanifest' ||
    url.pathname.startsWith('/web-app-manifest-')
  ) {
    target = BASE + url.pathname;
  }

  if (!target) return;

  event.respondWith((async () => {
    try {
      return await fetch(target, { credentials: 'same-origin' });
    } catch (e) {
      return new Response('', { status: 404 });
    }
  })());
});
