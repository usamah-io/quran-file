<script lang="ts">
  import { goto } from '$app/navigation';
  import { Headphones, Layers, Play } from 'lucide-svelte';
  import { appState } from '$lib/state/appState.svelte';

  const reciters = [
    { id: '05', name: 'Misyari Rasyid Al-Afasy' },
    { id: '01', name: 'Abdullah Al-Juhany' },
    { id: '02', name: 'Abdul Muhsin Al-Qasim' },
    { id: '03', name: 'Abdurrahman As-Sudais' },
    { id: '04', name: 'Ibrahim Al-Dossari' }
  ];
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
      <Headphones size={22} />
    </div>
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Murottal</h1>
      <p class="text-sm text-slate-600 dark:text-slate-400">Audio tilawah per ayat dari 5 qari pilihan.</p>
    </div>
  </div>

  <div class="rounded-3xl glass-card p-6 sm:p-8 space-y-5">
    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
      Putar murottal saat membaca mushaf. Pilih surat, lalu tekan ikon audio pada ayat yang ingin didengarkan.
    </p>

    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Qari tersedia</p>
      <ul class="space-y-2">
        {#each reciters as reciter}
          <li class="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200">
            {reciter.name}
          </li>
        {/each}
      </ul>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        type="button"
        onclick={() => goto('/dashboard?surah=1')}
        class="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Play size={16} />
        <span>Buka Al-Fatihah</span>
      </button>
      <button
        type="button"
        onclick={() => (appState.isSurahSelectorOpen = true)}
        class="flex-1 py-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Layers size={16} class="text-emerald-600 dark:text-emerald-400" />
        <span>Pilih Surat</span>
      </button>
    </div>
  </div>
</div>
