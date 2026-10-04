<script lang="ts">
  import { X, BookOpen, ScrollText, BookmarkCheck, Copy, Check } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import type { AsbabunNuzulItem } from '../types/quran';

  interface Props {
    isOpen: boolean;
    item: AsbabunNuzulItem | null;
    onClose: () => void;
  }

  let { isOpen, item, onClose }: Props = $props();

  let copied = $state(false);

  function copyText() {
    if (!item) return;
    const content = `[Asbabun Nuzul - QS. ${item.surahNama}: ${item.ayatNomor}]\nTema: ${item.tema}\n\nRiwayat:\n${item.riwayat}\n\nLatar Belakang & Kisah:\n${item.kisah}\n\nSumber: ${item.sumber}`;
    navigator.clipboard.writeText(content);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen && item}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdrop}
  >
    <!-- Modal Dialog -->
    <div
      class="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-300/40 dark:shadow-emerald-950/40 overflow-hidden transition-colors"
      transition:fly={{ y: 25, duration: 250 }}
    >
      <!-- Top Decorative Glow -->
      <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/15 blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="relative flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 backdrop-blur-xl">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <ScrollText size={20} />
          </div>
          <div>
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">Latar Belakang Wahyu</span>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              QS. {item.surahNama} : Ayat {item.ayatNomor}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onclick={onClose}
          class="p-2 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Tutup Modal"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Content Scrollable Body -->
      <div class="relative p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
        <!-- Title Badge -->
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
          <span class="text-xs font-bold text-amber-800 dark:text-amber-400 block mb-1">Tema Pokok</span>
          <h4 class="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200">
            {item.tema}
          </h4>
        </div>

        <!-- Riwayat Transmisi -->
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <BookmarkCheck size={16} class="text-teal-600 dark:text-teal-400" />
            <span>Jalur Riwayat Perawi:</span>
          </div>
          <p class="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-xs sm:text-sm italic">
            "{item.riwayat}"
          </p>
        </div>

        <!-- Story / Narration -->
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <BookOpen size={16} class="text-emerald-600 dark:text-emerald-400" />
            <span>Kisah & Konteks Peristiwa:</span>
          </div>
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {item.kisah}
          </div>
        </div>

        <!-- Sumber Referensi -->
        <div class="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
          <div>
            <span>Rujukan Kitab: </span>
            <span class="text-slate-800 dark:text-slate-300 font-semibold">{item.sumber}</span>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
        <button
          type="button"
          onclick={copyText}
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          {#if copied}
            <Check size={14} class="text-emerald-600 dark:text-emerald-400" />
            <span class="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
          {:else}
            <Copy size={14} />
            <span>Salin Ringkasan</span>
          {/if}
        </button>

        <button
          type="button"
          onclick={onClose}
          class="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/30"
        >
          Selesai Membaca
        </button>
      </div>
    </div>
  </div>
{/if}
