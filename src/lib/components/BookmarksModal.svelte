<script lang="ts">
  import { X, Bookmark, Trash2, ArrowUpRight } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import type { BookmarkItem } from '../types/quran';

  interface Props {
    isOpen: boolean;
    bookmarks: BookmarkItem[];
    onClose: () => void;
    onSelectBookmark: (b: BookmarkItem) => void;
    onRemoveBookmark: (b: BookmarkItem) => void;
  }

  let {
    isOpen,
    bookmarks,
    onClose,
    onSelectBookmark,
    onRemoveBookmark
  }: Props = $props();

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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    transition:fade={{ duration: 180 }}
    onclick={handleBackdrop}
  >
    <div
      class="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden transition-colors"
      transition:fly={{ y: 20, duration: 220 }}
    >
      <!-- Header -->
      <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Bookmark size={20} class="fill-emerald-600 dark:fill-emerald-400" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Ayat Yang Disimpan</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{bookmarks.length} ayat tersimpan di perangkat Anda</p>
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

      <!-- List -->
      <div class="p-6 overflow-y-auto space-y-3">
        {#if bookmarks.length === 0}
          <div class="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
            <Bookmark size={40} class="mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
            <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada ayat yang disimpan</p>
            <p class="text-xs text-slate-400 dark:text-slate-500">Klik ikon bookmark pada ayat untuk menyimpannya ke daftar ini.</p>
          </div>
        {:else}
          {#each bookmarks as b}
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 flex flex-col gap-2 transition-all">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    QS. {b.surahNamaLatin} : {b.ayatNomor}
                  </span>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    onclick={() => {
                      onSelectBookmark(b);
                      onClose();
                    }}
                    class="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 font-semibold transition-colors"
                  >
                    <span>Buka Ayat</span>
                    <ArrowUpRight size={13} />
                  </button>

                  <button
                    type="button"
                    onclick={() => onRemoveBookmark(b)}
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Hapus simpanan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <!-- Arabic preview snippet -->
              <p class="font-arabic text-sm text-slate-800 dark:text-slate-200 text-right line-clamp-1">
                {b.teksArab}
              </p>

              <!-- Translation snippet -->
              <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                "{b.teksIndonesia}"
              </p>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
