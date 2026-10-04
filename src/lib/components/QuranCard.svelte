<script lang="ts">
  import {
    Play,
    Pause,
    Bookmark,
    Copy,
    Check,
    ScrollText,
    ChevronDown,
    ChevronUp
  } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import type { Ayah, AsbabunNuzulItem } from '../types/quran';

  interface Props {
    ayah: Ayah;
    surahNomor: number;
    surahNamaLatin: string;
    isPlaying?: boolean;
    isBookmarked?: boolean;
    showLatin?: boolean;
    arabicSize?: 'sm' | 'md' | 'lg' | 'xl';
    onPlayAudio?: (ayah: Ayah) => void;
    onToggleBookmark?: (ayah: Ayah) => void;
    onOpenAsbabunNuzul?: (asbab: AsbabunNuzulItem) => void;
  }

  let {
    ayah,
    surahNomor,
    surahNamaLatin,
    isPlaying = false,
    isBookmarked = false,
    showLatin = true,
    arabicSize = 'lg',
    onPlayAudio,
    onToggleBookmark,
    onOpenAsbabunNuzul
  }: Props = $props();

  let isAsbabExpanded = $state(false);
  let copied = $state(false);

  // Dynamic Arabic Font Size
  const arabicTextClass = $derived(() => {
    switch (arabicSize) {
      case 'sm':
        return 'text-xl sm:text-2xl leading-[2.2]';
      case 'md':
        return 'text-2xl sm:text-3xl leading-[2.4]';
      case 'xl':
        return 'text-4xl sm:text-5xl leading-[2.8]';
      case 'lg':
      default:
        return 'text-3xl sm:text-4xl leading-[2.5]';
    }
  });

  function handleCopy() {
    const text = `[QS. ${surahNamaLatin}: ${ayah.nomorAyat}]\n\n${ayah.teksArab}\n\n${ayah.teksLatin}\n\nArtinya:\n"${ayah.teksIndonesia}"`;
    navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div
  id="ayah-{surahNomor}-{ayah.nomorAyat}"
  class="group relative scroll-mt-24 rounded-2xl glass-card p-5 sm:p-7 transition-colors duration-200 {isPlaying
    ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20'
    : 'border-slate-200 dark:border-white/10 hover:border-emerald-500/40'}"
>
  <!-- Active Player Glow -->
  {#if isPlaying}
    <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-3xl pointer-events-none"></div>
  {/if}

  <!-- Header Bar: Ayat Badge & Action Buttons -->
  <div class="flex items-center justify-between flex-wrap gap-3 pb-4 mb-3 border-b border-slate-200 dark:border-slate-800/80">
    <!-- Surah & Ayat Tag -->
    <div class="flex items-center gap-2.5">
      <div
      class="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all {isPlaying
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20'
          : 'bg-slate-100 dark:bg-slate-800/90 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 group-hover:border-emerald-500/40'}"
      >
        {ayah.nomorAyat}
      </div>

      <div>
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">QS. {surahNamaLatin}</span>
        <span class="text-[11px] text-slate-500 dark:text-slate-500 block">Ayat ke-{ayah.nomorAyat}</span>
      </div>
    </div>

    <!-- Actions Toolbar -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <!-- Audio Button -->
      <button
        type="button"
        onclick={() => onPlayAudio?.(ayah)}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all {isPlaying
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'}"
        title={isPlaying ? 'Jeda Audio' : 'Putar Murottal Ayat'}
      >
        {#if isPlaying}
          <div class="flex items-center gap-0.5 h-3">
            <span class="w-1 h-3 bg-white rounded-full animate-bounce"></span>
            <span class="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></span>
            <span class="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></span>
          </div>
          <Pause size={14} />
        {:else}
          <Play size={14} />
          <span class="hidden sm:inline">Murottal</span>
        {/if}
      </button>

      <!-- Asbabun Nuzul Badge / Button (if present) -->
      {#if ayah.asbabunNuzul}
        <button
          type="button"
          onclick={() => {
            isAsbabExpanded = !isAsbabExpanded;
          }}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all shadow-sm shadow-amber-500/10"
          title="Lihat Asbabun Nuzul"
        >
          <ScrollText size={14} class="text-amber-600 dark:text-amber-400" />
          <span class="hidden sm:inline">Asbabun Nuzul</span>
          {#if isAsbabExpanded}
            <ChevronUp size={13} />
          {:else}
            <ChevronDown size={13} />
          {/if}
        </button>
      {/if}

      <!-- Bookmark Button -->
      <button
        type="button"
        onclick={() => onToggleBookmark?.(ayah)}
        class="p-2 rounded-xl text-xs transition-colors {isBookmarked
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'}"
        title={isBookmarked ? 'Hapus Simpanan' : 'Simpan Ayat'}
      >
        <Bookmark size={15} class={isBookmarked ? 'fill-emerald-500' : ''} />
      </button>

      <!-- Copy Button -->
      <button
        type="button"
        onclick={handleCopy}
        class="p-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors"
        title="Salin Ayat"
      >
        {#if copied}
          <Check size={15} class="text-emerald-600 dark:text-emerald-400" />
        {:else}
          <Copy size={15} />
        {/if}
      </button>
    </div>
  </div>

  <!-- Arabic Typography Container -->
  <div class="py-3 my-1 text-right">
    <p class="font-arabic font-normal text-slate-900 dark:text-slate-100 {arabicTextClass()} selection:bg-emerald-500/40">
      {ayah.teksArab}
      <span class="inline-flex items-center justify-center align-middle mx-1 w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-sans text-xs select-none">
        {ayah.nomorAyat}
      </span>
    </p>
  </div>

  <!-- Latin Transliteration (Optional Toggle) -->
  {#if showLatin && ayah.teksLatin}
    <div class="pt-2 pb-3">
      <p class="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 tracking-wide leading-relaxed">
        {ayah.teksLatin}
      </p>
    </div>
  {/if}

  <!-- Indonesian Translation -->
  <div class="pt-2">
    <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
      {ayah.teksIndonesia}
    </p>
  </div>

  <!-- In-Card Asbabun Nuzul Expandable Accordion -->
  {#if isAsbabExpanded && ayah.asbabunNuzul}
    <div
      transition:slide={{ duration: 250 }}
      class="mt-6 pt-5 border-t border-amber-500/20 bg-amber-50/50 dark:bg-gradient-to-b dark:from-amber-500/5 dark:to-transparent rounded-2xl p-5"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <ScrollText size={16} class="text-amber-600 dark:text-amber-400" />
          <span class="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            Asbabun Nuzul: {ayah.asbabunNuzul.tema}
          </span>
        </div>

        <button
          type="button"
          onclick={() => onOpenAsbabunNuzul?.(ayah.asbabunNuzul!)}
          class="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold"
        >
          Buka Dialog Penuh →
        </button>
      </div>

      <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-amber-200/80 dark:border-slate-800">
        "{ayah.asbabunNuzul.kisah}"
      </p>

      <div class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span class="font-semibold text-slate-600 dark:text-slate-500">Riwayat & Sumber: </span>
        <span>{ayah.asbabunNuzul.riwayat} ({ayah.asbabunNuzul.sumber})</span>
      </div>
    </div>
  {/if}
</div>
