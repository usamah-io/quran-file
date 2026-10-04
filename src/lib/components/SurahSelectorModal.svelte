<script lang="ts">
  import { X, Search, Layers } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import { SURAH_LIST } from '../data/surahList';
  import type { SurahInfo } from '../types/quran';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectSurah: (surah: SurahInfo) => void;
  }

  let { isOpen, onClose, onSelectSurah }: Props = $props();

  let query = $state('');
  let filterPlace = $state<'all' | 'Mekah' | 'Madinah'>('all');

  const filteredSurahs = $derived(() => {
    const q = query.trim().toLowerCase();
    return SURAH_LIST.filter((s) => {
      const matchPlace = filterPlace === 'all' || s.tempatTurun === filterPlace;
      const matchQuery =
        !q ||
        s.namaLatin.toLowerCase().includes(q) ||
        s.nama.includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        String(s.nomor) === q;
      return matchPlace && matchQuery;
    });
  });

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md"
    transition:fade={{ duration: 180 }}
    onclick={handleBackdrop}
  >
    <div
      class="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden transition-colors"
      transition:fly={{ y: 20, duration: 220 }}
    >
      <!-- Header -->
      <div class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Layers size={20} />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Daftar 114 Surat Al-Qur'an</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Pilih surat untuk membaca ayat dan asbabun nuzul</p>
          </div>
        </div>

        <button
          type="button"
          onclick={onClose}
          class="p-2 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Search & Filters in Modal -->
      <div class="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <!-- Search bar inside modal -->
        <div class="relative w-full sm:w-80">
          <Search size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            bind:value={query}
            placeholder="Cari nomor atau nama surat..."
            class="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <!-- Filter tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/60 rounded-xl border border-slate-300 dark:border-slate-700/60 text-xs">
          <button
            type="button"
            onclick={() => (filterPlace = 'all')}
            class="px-3 py-1.5 rounded-lg font-medium transition-all {filterPlace === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
          >
            Semua (114)
          </button>
          <button
            type="button"
            onclick={() => (filterPlace = 'Mekah')}
            class="px-3 py-1.5 rounded-lg font-medium transition-all {filterPlace === 'Mekah'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
          >
            Makkiyyah
          </button>
          <button
            type="button"
            onclick={() => (filterPlace = 'Madinah')}
            class="px-3 py-1.5 rounded-lg font-medium transition-all {filterPlace === 'Madinah'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
          >
            Madaniyyah
          </button>
        </div>
      </div>

      <!-- Surah Grid List -->
      <div class="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each filteredSurahs() as surah}
          <button
            type="button"
            onclick={() => {
              onSelectSurah(surah);
              onClose();
            }}
            class="group text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/50 transition-all duration-200 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {surah.nomor}
              </div>
              <div>
                <div class="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {surah.namaLatin}
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">
                  {surah.arti} • {surah.jumlahAyat} ayat
                </div>
              </div>
            </div>

            <div class="text-right">
              <span class="font-arabic text-base sm:text-lg text-emerald-700 dark:text-emerald-400 block leading-tight">
                {surah.nama}
              </span>
              <span class="text-[10px] text-slate-500 uppercase tracking-wider">
                {surah.tempatTurun}
              </span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}
