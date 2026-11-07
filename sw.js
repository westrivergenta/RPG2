// ルミナ伝承 サービスワーカー
// ゲームを 更新したら CACHE の 名前（v1 → v2 …）を かえてください。
const CACHE = 'lumina-densho-v3';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/alliance.jpg', 'assets/gates.png', 'assets/goddess.webp', 'assets/monsters.webp',
  'assets/portraits.jpg', 'assets/rulers.jpg', 'assets/selka.jpg', 'assets/tiles.png', 'assets/title.jpg',
  'assets/town1.jpg', 'assets/town2.jpg', 'assets/town3.jpg', 'assets/town4.jpg', 'assets/town5.jpg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // ページ本体は 新しい ものを 先に、つながらない ときは 保存した ものを つかう
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // 画像や フォントは 保存した ものを 先に つかう
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && (new URL(req.url).origin === location.origin || req.url.includes('fonts.g'))) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
