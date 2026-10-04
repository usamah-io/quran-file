import { self } from '$app/service-worker';
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';

const CACHE_PREFIX = 'quran-search-';
const SHELL_CACHE = `${CACHE_PREFIX}${version}`;
const shellAssets = [
	...immutable.map((asset) => asset.path),
	...assets.map((asset) => asset.path).filter((path) =>
		path === '/offline.html' || path === '/manifest.webmanifest' || path.startsWith('/icons/')
	)
].map((path) => new URL(path, self.location.origin).toString());

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(shellAssets)));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE).map((key) => caches.delete(key)));
			await self.clients.claim();
		})
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	const request = event.request;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;
	if (url.pathname.startsWith('/api/') || request.destination === 'audio' || url.pathname.startsWith('/audio/')) return;

	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(async () => {
				const cache = await caches.open(SHELL_CACHE);
				return (await cache.match('/offline.html')) ?? Response.error();
			})
		);
		return;
	}

	if (shellAssets.includes(request.url)) {
		event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
	}
});
