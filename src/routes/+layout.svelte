<script lang="ts">
  import './layout.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
  import AudioPlayerBar from '$lib/components/AudioPlayerBar.svelte';
  import SurahSelectorModal from '$lib/components/SurahSelectorModal.svelte';
  import BookmarksModal from '$lib/components/BookmarksModal.svelte';
  import AsbabunNuzulModal from '$lib/components/AsbabunNuzulModal.svelte';
  import { appState } from '$lib/state/appState.svelte';
  import { page } from '$app/state';
  import { afterNavigate, goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import type { SurahInfo, BookmarkItem } from '$lib/types/quran';

  let { children } = $props();
  let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  afterNavigate(() => {
    if (serviceWorkerRegistration) void serviceWorkerRegistration.update().catch(() => undefined);
  });

  onMount(() => {
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      appState.installPrompt = event as typeof appState.installPrompt;
    };
    const installed = () => (appState.installPrompt = null);
    const controllerChanged = () => {
      if (appState.updateAvailable && !appState.currentPlayingAyah) window.location.reload();
    };
    const checkForUpdateWhenVisible = () => {
      if (document.visibilityState === 'visible' && serviceWorkerRegistration) {
        void serviceWorkerRegistration.update().catch(() => undefined);
      }
    };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', installed);
    navigator.serviceWorker?.addEventListener('controllerchange', controllerChanged);
    document.addEventListener('visibilitychange', checkForUpdateWhenVisible);

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.ready.then(async (registration) => {
        serviceWorkerRegistration = registration;
        const checkWaiting = () => {
          if (registration.waiting && navigator.serviceWorker.controller) {
            appState.updateWorker = registration.waiting;
            appState.updateAvailable = true;
          }
        };
        checkWaiting();
        registration.addEventListener('updatefound', () => {
          registration.installing?.addEventListener('statechange', checkWaiting);
        });
        await registration.update().catch(() => undefined);
        checkWaiting();
      }).catch(() => undefined);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', installed);
      navigator.serviceWorker?.removeEventListener('controllerchange', controllerChanged);
      document.removeEventListener('visibilitychange', checkForUpdateWhenVisible);
      serviceWorkerRegistration = null;
    };
  });

  const activeTab = $derived(() => {
    const path = page.url.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/dashboard')) return 'search';
    if (path.startsWith('/surah')) return 'surah';
    if (path.startsWith('/asbabun-nuzul')) return 'asbabun_nuzul';
    return 'home';
  });

  function handleTabSelect(tab: 'home' | 'search' | 'surah' | 'asbabun_nuzul' | 'bookmarks') {
    if (tab === 'home') {
      goto('/');
    } else if (tab === 'search') {
      goto('/dashboard?search=1');
    } else if (tab === 'surah') {
      appState.isSurahSelectorOpen = true;
    } else if (tab === 'asbabun_nuzul') {
      goto('/dashboard?mode=asbabun_nuzul');
    } else if (tab === 'bookmarks') {
      appState.isBookmarksOpen = true;
    }
  }

  function handleSelectSurah(surah: SurahInfo) {
    goto(`/dashboard?surah=${surah.nomor}`);
  }
</script>

<svelte:head>
  <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#28684f" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Quran Search" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
</svelte:head>

<!-- Ambient Background Glow -->
<div class="ambient-glow"></div>

<div class="min-h-screen flex flex-col relative z-10">
  <Navbar
    activeTab={activeTab()}
    onTabSelect={handleTabSelect}
    onOpenSurahSelector={() => (appState.isSurahSelectorOpen = true)}
    bookmarkCount={appState.bookmarks.length}
  />

  <main
    class="flex-1 pb-24 {appState.currentPlayingAyah
      ? 'max-md:pb-[calc(12.5rem+env(safe-area-inset-bottom,0px))]'
      : 'max-md:pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]'}"
  >
    {#key page.url.pathname}
      <div in:fade={{ duration: 180, delay: 50 }} out:fade={{ duration: 120 }}>
        {@render children()}
      </div>
    {/key}
  </main>

  <!-- Global Modals & Controls -->
  <SurahSelectorModal
    isOpen={appState.isSurahSelectorOpen}
    onClose={() => (appState.isSurahSelectorOpen = false)}
    onSelectSurah={handleSelectSurah}
  />

  <BookmarksModal
    isOpen={appState.isBookmarksOpen}
    bookmarks={appState.bookmarks}
    onClose={() => (appState.isBookmarksOpen = false)}
    onSelectBookmark={(b: BookmarkItem) => {
      goto(`/dashboard?surah=${b.surahNomor}#ayah-${b.surahNomor}-${b.ayatNomor}`);
    }}
    onRemoveBookmark={(b: BookmarkItem) => appState.removeBookmark(b)}
  />

  <AsbabunNuzulModal
    isOpen={appState.isAsbabunNuzulModalOpen}
    item={appState.selectedAsbabunNuzul}
    onClose={() => appState.closeAsbabunNuzul()}
  />

  <!-- Global Sticky Audio Player -->
  <AudioPlayerBar />

  <MobileBottomNav />
</div>
