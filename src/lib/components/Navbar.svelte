<script lang="ts">
  import {
    BookOpen,
    Search,
    ScrollText,
    Bookmark,
    Layers,
    Menu,
    X,
    Moon,
    Sun
  } from 'lucide-svelte';
  import { appState } from '$lib/state/appState.svelte';

  interface Props {
    activeTab: 'home' | 'search' | 'surah' | 'asbabun_nuzul' | 'bookmarks';
    onTabSelect: (tab: 'home' | 'search' | 'surah' | 'asbabun_nuzul' | 'bookmarks') => void;
    onOpenSurahSelector: () => void;
    bookmarkCount?: number;
  }

  let {
    activeTab = 'home',
    onTabSelect,
    onOpenSurahSelector,
    bookmarkCount = 0
  }: Props = $props();

  let mobileMenuOpen = $state(false);

  $effect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  });

  function closeMenu() {
    mobileMenuOpen = false;
  }

  function handleNav(tab: 'home' | 'search' | 'surah' | 'asbabun_nuzul' | 'bookmarks') {
    onTabSelect(tab);
    mobileMenuOpen = false;
  }
</script>

<svelte:window onkeydown={(event) => { if (event.key === 'Escape') closeMenu(); }} />

<header class="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/90 dark:border-slate-800/80 transition-colors duration-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] md:h-[72px] flex items-center justify-between">
    <!-- Brand Logo -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <a href="/" class="flex items-center gap-3 cursor-pointer group select-none">
      <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
        <div class="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center transition-colors">
          <BookOpen class="text-emerald-600 dark:text-emerald-400 group-hover:rotate-6 transition-transform" size={20} />
        </div>
        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white dark:border-slate-950"></div>
      </div>

      <div>
        <div class="flex items-center gap-1.5">
          <span class="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
            Quran Search
          </span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden sm:block">
          Ayat, Terjemahan & Asbabun Nuzul
        </p>
      </div>
    </a>

    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/70 transition-colors">
      <button
        type="button"
        onclick={() => handleNav('home')}
        class="px-4 py-2 rounded-xl text-xs font-semibold transition-all {activeTab === 'home'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/50'}"
      >
        Beranda
      </button>

      <button
        type="button"
        onclick={() => handleNav('search')}
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all {activeTab === 'search'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/50'}"
      >
        <Search size={14} />
        <span>Pencarian</span>
      </button>

      <button
        type="button"
        onclick={() => handleNav('surah')}
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all {activeTab === 'surah'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/50'}"
      >
        <Layers size={14} />
        <span>Daftar 114 Surat</span>
      </button>

      <button
        type="button"
        onclick={() => handleNav('asbabun_nuzul')}
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all {activeTab === 'asbabun_nuzul'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/50'}"
      >
        <ScrollText size={14} />
        <span>Asbabun Nuzul</span>
      </button>

      <button
        type="button"
        onclick={() => handleNav('bookmarks')}
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all {activeTab === 'bookmarks'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/50'}"
      >
        <Bookmark size={14} />
        <span>Tersimpan</span>
        {#if bookmarkCount > 0}
          <span class="w-4 h-4 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center justify-center font-bold">
            {bookmarkCount}
          </span>
        {/if}
      </button>
    </nav>

    <!-- Header Action Controls -->
    <div class="relative z-50 flex items-center gap-2">
      <!-- Quick Surah Selector Button -->
      <button
        type="button"
        onclick={onOpenSurahSelector}
        class="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
      >
        <Layers size={14} class="text-emerald-600 dark:text-emerald-400" />
        <span>Pilih Surat</span>
      </button>

      <!-- Theme Switcher -->
      <button
        type="button"
        onclick={() => appState.toggleTheme()}
        class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors"
        title={appState.theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      >
        {#if appState.theme === 'dark'}
          <Sun size={17} class="text-amber-400" />
        {:else}
          <Moon size={17} class="text-emerald-600" />
        {/if}
      </button>

      <!-- Mobile Hamburger Toggle -->
      <button
        type="button"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="p-2.5 rounded-xl md:hidden bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
        aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-utility-menu"
      >
        {#if mobileMenuOpen}
          <X size={20} />
        {:else}
          <Menu size={20} />
        {/if}
      </button>
    </div>
  </div>

  {#if mobileMenuOpen}
    <button class="fixed inset-0 z-40 bg-black/25 md:hidden" aria-label="Tutup menu" tabindex="-1" onclick={closeMenu}></button>
  {/if}

  <!-- Mobile utility menu; primary navigation remains in the fixed bottom bar. -->
  {#if mobileMenuOpen}
    <nav id="mobile-utility-menu" aria-label="Menu" class="absolute right-3 top-[calc(100%+8px)] z-50 w-[min(20rem,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950 md:hidden">
      <h2 class="mb-2 px-2 text-sm font-semibold text-slate-900 dark:text-white">Menu</h2>
      <button
        type="button"
        onclick={() => handleNav('home')}
        class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 {activeTab === 'home' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : ''}"
      >
        Beranda
      </button>

      <button
        type="button"
        onclick={() => { closeMenu(); onOpenSurahSelector(); }}
        class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 {activeTab === 'asbabun_nuzul' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : ''}"
      >
        <span>Daftar 114 Surat</span>
      </button>

      <button
        type="button"
        onclick={() => handleNav('asbabun_nuzul')}
        class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <ScrollText size={16} />
        <span>Asbabun Nuzul</span>
      </button>

      <button
        type="button"
        onclick={() => handleNav('bookmarks')}
        class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 {activeTab === 'bookmarks' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : ''}"
      >
        <span class="flex items-center gap-2">
          <Bookmark size={16} />
          <span>Ayat Tersimpan</span>
        </span>
        {#if bookmarkCount > 0}
          <span class="px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            {bookmarkCount}
          </span>
        {/if}
      </button>
    </nav>
  {/if}
</header>
