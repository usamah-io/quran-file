<script lang="ts">
  import { goto } from '$app/navigation';
  import { Bookmark, Download, Layers, Moon, RefreshCw, ScrollText, Settings2, Sun } from 'lucide-svelte';
  import { appState } from '$lib/state/appState.svelte';

  const bookmarkDesc = $derived(
    appState.bookmarks.length > 0
      ? `${appState.bookmarks.length} ayat tersimpan.`
      : 'Buka koleksi ayat yang Anda tandai.'
  );

  const extras = [
    {
      id: 'asbabun',
      icon: ScrollText,
      title: 'Asbabun Nuzul',
      desc: 'Latar belakang turunnya ayat-ayat Al-Qur\'an.',
      action: () => goto('/dashboard?mode=asbabun_nuzul'),
      accent: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'bookmarks',
      icon: Bookmark,
      title: 'Ayat Tersimpan',
      desc: '',
      action: () => (appState.isBookmarksOpen = true),
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'surah',
      icon: Layers,
      title: 'Daftar 114 Surat',
      desc: 'Pilih surat untuk dibaca di mushaf.',
      action: () => (appState.isSurahSelectorOpen = true),
      accent: 'text-cyan-600 dark:text-cyan-400'
    }
  ];
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
  <div class="mb-6">
    <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Lainnya</h1>
    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
      Fitur tambahan, koleksi, dan pengaturan tampilan.
    </p>
  </div>

  <div class="space-y-4">
    {#if appState.installPrompt}
      <button
        type="button"
        onclick={() => appState.installApp()}
        class="w-full text-left rounded-3xl glass-card p-5 flex items-start gap-4 border-emerald-500/30 hover:border-emerald-500/50 transition-colors"
      >
        <div class="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300"><Download size={20} /></div>
        <div><p class="font-bold text-slate-900 dark:text-white">Pasang Quran Search</p><p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Tambahkan ke layar utama untuk akses lebih cepat.</p></div>
      </button>
    {/if}

    {#if appState.updateAvailable}
      <div class="w-full text-left rounded-3xl glass-card p-5 flex items-start gap-4 border-emerald-500/30">
        <div class="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300"><RefreshCw size={20} /></div>
        <div class="flex-1"><p class="font-bold text-slate-900 dark:text-white">Pembaruan tersedia</p><p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Versi baru siap dipasang. Pemutar audio harus berhenti sebelum halaman dimuat ulang.</p></div>
        <button type="button" disabled={Boolean(appState.currentPlayingAyah)} onclick={() => appState.activateUpdate()} class="shrink-0 px-3 py-2 rounded-xl bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold">Perbarui</button>
      </div>
    {/if}

    {#each extras as item}
      {@const Icon = item.icon}
      <button
        type="button"
        onclick={item.action}
        class="w-full text-left rounded-3xl glass-card p-5 flex items-start gap-4 hover:border-emerald-500/40 transition-colors"
      >
        <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 {item.accent}">
          <Icon size={20} />
        </div>
        <div class="min-w-0">
          <p class="font-bold text-slate-900 dark:text-white">{item.title}</p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {item.id === 'bookmarks' ? bookmarkDesc : item.desc}
          </p>
        </div>
      </button>
    {/each}

    <div class="rounded-3xl glass-card p-5 flex items-center justify-between gap-4">
      <div class="flex items-start gap-4 min-w-0">
        <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
          <Settings2 size={20} />
        </div>
        <div>
          <p class="font-bold text-slate-900 dark:text-white">Tampilan</p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {appState.theme === 'dark' ? 'Mode gelap aktif' : 'Mode terang aktif'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onclick={() => appState.toggleTheme()}
        class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
        title={appState.theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      >
        {#if appState.theme === 'dark'}
          <Sun size={17} class="text-amber-400" />
        {:else}
          <Moon size={17} class="text-emerald-600" />
        {/if}
      </button>
    </div>
  </div>
</div>
