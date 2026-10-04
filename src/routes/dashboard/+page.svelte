<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import {
    BookOpen,
    Search,
    ScrollText,
    Layers,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Loader2,
    X
  } from 'lucide-svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import ContinueReadingCard from '$lib/components/ContinueReadingCard.svelte';
  import QuranCard from '$lib/components/QuranCard.svelte';
  import { quranService } from '$lib/services/quranService';
  import { appState } from '$lib/state/appState.svelte';
  import { SURAH_LIST } from '$lib/data/surahList';
  import { ASBABUN_NUZUL_DATABASE } from '$lib/data/asbabunNuzulData';
  import type { SurahDetail, Ayah, SearchMatch, AsbabunNuzulItem } from '$lib/types/quran';

  // Svelte 5 Reactive Runes State
  let searchQuery = $state('');
  let selectedMode = $state<'all' | 'terjemahan' | 'surah' | 'asbabun_nuzul'>('all');
  let activeFilterTag = $state('');
  let isSearchFocused = $state(false);
  let currentSurahNumber = $state<number>(1);
  let surahDetail = $state<SurahDetail | null>(null);
  let isLoadingSurah = $state(false);
  let isSearching = $state(false);
  let searchResults = $state<SearchMatch[]>([]);
  let searchRequestId = 0;
  const exactSearchResults = $derived(searchResults.filter((match) => match.searchSource !== 'semantic'));
  const semanticSearchResults = $derived(searchResults.filter((match) => match.searchSource === 'semantic'));

  // Search debounce timer
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Active search state: true if search text is entered OR user clicked into search input
  const isSearchRoute = $derived(
    page.url.searchParams.get('search') === '1' ||
    ['all', 'terjemahan'].includes(page.url.searchParams.get('mode') ?? '')
  );
  const isSearchActive = $derived(isSearchRoute || isSearchFocused || searchQuery.trim().length > 0);

  // Watch URL params
  $effect(() => {
    const surahParam = page.url.searchParams.get('surah');
    const modeParam = page.url.searchParams.get('mode');
    const qParam = page.url.searchParams.get('q');

    if (surahParam) {
      const num = Number(surahParam);
      if (!isNaN(num) && num >= 1 && num <= 114 && num !== currentSurahNumber) {
        currentSurahNumber = num;
        loadSurah(num);
      }
    }

    if (modeParam && ['all', 'terjemahan', 'surah', 'asbabun_nuzul'].includes(modeParam)) {
      selectedMode = modeParam as any;
    }

    if (qParam && qParam !== untrack(() => searchQuery)) {
      searchQuery = qParam;
      triggerSearch(qParam);
    } else if (!qParam && (isSearchRoute || modeParam === 'asbabun_nuzul' || !modeParam)) {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      quranService.cancelSemanticSearch();
      searchRequestId += 1;
      isSearching = false;
      searchQuery = '';
      activeFilterTag = '';
      isSearchFocused = false;
      searchResults = [];
      if (isSearchRoute) selectedMode = 'all';
    }
  });

  onMount(() => {
    const surahParam = page.url.searchParams.get('surah');
    const initialSurah = surahParam ? Number(surahParam) : 1;
    loadSurah(initialSurah);

    let scrollFrame = 0;
    const updateReadingPosition = () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const readingLine = window.innerHeight * 0.38;
        const cards = Array.from(document.querySelectorAll<HTMLElement>('[id^="ayah-"]'));
        const current = cards.find((card) => {
          const rect = card.getBoundingClientRect();
          return rect.top <= readingLine && rect.bottom >= readingLine;
        });
        const match = current?.id.match(/^ayah-(\d+)-(\d+)$/);
        if (match) appState.saveLastRead(Number(match[1]), Number(match[2]));
      });
    };
    window.addEventListener('scroll', updateReadingPosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateReadingPosition);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  });

  async function loadSurah(nomor: number) {
    isLoadingSurah = true;
    try {
      const data = await quranService.getSurahDetail(nomor);
      surahDetail = data;
      currentSurahNumber = nomor;
      await tick();
      const ayahHash = page.url.hash.match(/^#ayah-(\d+)-(\d+)$/);
      if (ayahHash && Number(ayahHash[1]) === nomor) {
        document.getElementById(`ayah-${nomor}-${Number(ayahHash[2])}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      console.error('Failed to load surah:', e);
    } finally {
      isLoadingSurah = false;
    }
  }

  function handleSearchInput(query: string) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      triggerSearch(query);
    }, 280);
  }

  async function triggerSearch(query: string) {
    const requestId = ++searchRequestId;
    if (!query || !query.trim()) {
      quranService.cancelSemanticSearch();
      searchResults = [];
      isSearching = false;
      return;
    }

    isSearching = true;
    try {
      const results = await quranService.search({
        query,
        mode: selectedMode
      });
      if (requestId === searchRequestId) searchResults = results;
    } catch (e) {
      if (requestId === searchRequestId) searchResults = [];
    } finally {
      if (requestId === searchRequestId) isSearching = false;
    }
  }

  function closeSearchMode() {
    searchRequestId += 1;
    quranService.cancelSemanticSearch();
    if (debounceTimeout) clearTimeout(debounceTimeout);
    searchQuery = '';
    activeFilterTag = '';
    isSearchFocused = false;
    searchResults = [];
    isSearching = false;
  }

  function navigateSurah(delta: number) {
    const target = currentSurahNumber + delta;
    if (target >= 1 && target <= 114) {
      goto(`/dashboard?surah=${target}`);
      loadSurah(target);
    }
  }

  function selectSurahFromSearch(surahNomor: number) {
    closeSearchMode();
    goto(`/dashboard?surah=${surahNomor}`);
    loadSurah(surahNomor);
  }

  function openSearchMatch(match: SearchMatch) {
    if (match.asbabunNuzul) {
      appState.openAsbabunNuzul(match.asbabunNuzul);
      return;
    }
    if (match.type === 'ayah' && match.ayatNomor && Number.isInteger(Number(match.ayatNomor))) {
      const ayahNumber = Number(match.ayatNomor);
      closeSearchMode();
      goto(`/dashboard?surah=${match.surahNomor}#ayah-${match.surahNomor}-${ayahNumber}`);
      loadSurah(match.surahNomor);
      return;
    }
    selectSurahFromSearch(match.surahNomor);
  }
</script>

<svelte:head>
  <title>Dashboard & Pencarian — Quran Search</title>
</svelte:head>

{#snippet resultRows(matches: SearchMatch[])}
  {#each matches as match}
    <button
      type="button"
      onclick={() => openSearchMatch(match)}
      class="group flex min-h-11 w-full items-start justify-between gap-4 py-4 text-left transition-colors first:pt-2 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
    >
      <span class="min-w-0">
        <span class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span class="font-semibold text-slate-900 transition-colors group-hover:text-emerald-800 dark:text-slate-100 dark:group-hover:text-emerald-300">{match.surahNamaLatin}{match.ayatNomor ? ` · Ayat ${match.ayatNomor}` : ''}</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">{match.type === 'asbabun_nuzul' ? 'Asbabun Nuzul' : match.type === 'ayah' ? 'Terjemahan' : 'Surat'}</span>
        </span>
        {#if match.asbabunNuzul}
          <span class="mt-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{match.asbabunNuzul.tema}</span>
        {/if}
        <span class="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">{match.snippet}</span>
      </span>
      <span class="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-300">
        {match.asbabunNuzul ? 'Pelajari' : 'Buka'} <ArrowUpRight size={14} aria-hidden="true" />
      </span>
    </button>
  {/each}
{/snippet}

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
  <!-- HERO SEARCH AREA (Pusat & Proporsional di tengah halaman) -->
  <section class="mx-auto max-w-3xl space-y-3 pt-1 pb-1 sm:space-y-4">
    <div class="space-y-1 text-center sm:text-left">
      <h1 class="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        Temukan ayat yang kamu cari.
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Cari surat, ayat, terjemahan, atau Asbabun Nuzul.
      </p>
    </div>

    <!-- Search Bar Component -->
    <div>
      <SearchBar
        bind:searchQuery
        bind:activeFilterTag
        bind:isFocused={isSearchFocused}
        onSearchChange={handleSearchInput}
        onFocusChange={(focused: boolean) => {
          isSearchFocused = focused;
        }}
      />
    </div>
  </section>

  <!-- ANIMASI REAKTIF: KETIKA PENGGUNA MENGKLIK ATAU MENGETIK DI SEARCH BAR -->
  {#if isSearchActive}
    <div
      in:fly={{ y: 20, duration: 300 }}
      out:fade={{ duration: 180 }}
      class="mx-auto max-w-3xl space-y-4"
    >
      {#if !searchQuery.trim()}
        <ContinueReadingCard compact />
      {/if}
      {#if isSearching || searchQuery.trim()}
        <div class="flex min-h-8 items-center gap-2 text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          {#if isSearching}
            <Loader2 size={16} class="shrink-0 animate-spin text-emerald-700 dark:text-emerald-400" />
            <span>Mencari ayat yang relevan...</span>
          {:else}
            <span class="truncate">{searchResults.length} hasil untuk “{searchQuery}”</span>
          {/if}
        </div>
      {/if}

      <!-- Live Search Results (2-Column Balanced Grid) -->
      {#if searchQuery.trim()}
        {#if searchResults.length === 0 && !isSearching}
          <div class="py-10 text-center">
            <h3 class="text-sm font-medium text-slate-800 dark:text-slate-200">Belum ada hasil yang cocok.</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Coba kata kunci lain atau periksa ejaan nama surat dan tema.
            </p>
          </div>
        {:else}
          <div class="divide-y divide-slate-200 dark:divide-slate-800">
            {#if exactSearchResults.length && semanticSearchResults.length}
              <h2 class="pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hasil pencarian</h2>
            {/if}
            {@render resultRows(exactSearchResults)}
            {#if semanticSearchResults.length}
              <h2 class="pt-5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ayat terkait</h2>
              {@render resultRows(semanticSearchResults)}
            {/if}
          </div>
        {/if}

      <!-- Suggestions Overlay (when clicked on search bar but hasn't typed yet) -->
      {:else}
        <div class="space-y-5 py-4">
          <div class="space-y-1">
            <h2 class="text-sm font-medium text-slate-800 dark:text-slate-200">Mulai pencarian</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Cari nama surat, ayat, tema, atau kisah di balik turunnya wahyu.</p>
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            {#each [
              { no: 18, name: 'Al-Kahfi' },
              { no: 36, name: 'Yasin' },
              { no: 67, name: 'Al-Mulk' }
            ] as s}
              <button type="button" onclick={() => selectSurahFromSearch(s.no)} class="min-h-10 underline decoration-slate-300 underline-offset-4 hover:text-emerald-700 dark:decoration-slate-600 dark:hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm">QS. {s.name}</button>
            {/each}
            <button
              type="button"
              onclick={() => {
                selectedMode = 'asbabun_nuzul';
                searchQuery = 'doa';
                isSearchFocused = true;
                triggerSearch('doa');
              }}
              class="min-h-10 underline decoration-slate-300 underline-offset-4 hover:text-emerald-700 dark:decoration-slate-600 dark:hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm"
            >Asbabun Nuzul: doa</button>
          </div>
        </div>
      {/if}
    </div>

  <!-- KONTEN DEFAULT: MUSHAF SURAT / ENSIKLOPEDIA (DITAMPILKAN KETIKA TIDAK SEARCH) -->
  {:else if selectedMode === 'asbabun_nuzul'}
    <!-- Asbabun Nuzul Dedicated Mode View (2-Column Grid) -->
    <section in:fade={{ duration: 250 }} class="space-y-6">
      <div class="p-6 rounded-3xl glass-card border border-amber-500/25 bg-amber-50/50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <ScrollText size={20} />
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Ensiklopedia Asbabun Nuzul</h2>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Menyelami konteks historis, sabab wurud, dan riwayat terpercaya di balik firman-firman Allah SWT.
          </p>
        </div>

        <button
          type="button"
          onclick={() => (selectedMode = 'all')}
          class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shrink-0"
        >
          Lihat Mushaf Surat
        </button>
      </div>

      <!-- 2-COLUMN BALANCED GRID FOR ASBABUN NUZUL -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {#each ASBABUN_NUZUL_DATABASE as item}
          <div class="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800/90 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="flex flex-wrap items-start gap-2">
                <span class="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  QS. {item.surahNama} : {item.ayatNomor}
                </span>
                <span class="min-w-0 flex-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{item.sumber}</span>
              </div>

              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {item.tema}
              </h3>

              <div class="text-xs text-slate-500 dark:text-slate-400 italic">
                "{item.riwayat}"
              </div>

              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {item.kisah}
              </p>
            </div>

            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onclick={() => appState.openAsbabunNuzul(item)}
                class="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ScrollText size={14} />
                <span>Baca Narasi Lengkap</span>
              </button>

              <button
                type="button"
                onclick={() => {
                  goto(`/dashboard?surah=${item.surahNomor}`);
                  loadSurah(item.surahNomor);
                }}
                class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Buka di Mushaf</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>

  <!-- Mushaf Surah Reading View (smoothly restored when not searching) -->
  {:else}
    <section in:fade={{ duration: 250 }} class="space-y-6">
      <ContinueReadingCard />
      {#if isLoadingSurah}
        <div class="p-16 text-center rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-4">
          <Loader2 size={36} class="mx-auto text-emerald-600 dark:text-emerald-400 animate-spin" />
          <p class="text-sm text-slate-600 dark:text-slate-300">Memuat teks surat & asbabun nuzul...</p>
        </div>
      {:else if surahDetail}
        <!-- Surah Hero Card -->
        <div class="relative rounded-3xl glass-card border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2.5">
                <span class="px-3 py-1 rounded-xl bg-emerald-600/15 border border-emerald-600/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  Surat ke-{surahDetail.nomor}
                </span>
                <span class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {surahDetail.tempatTurun}
                </span>
                <span class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {surahDetail.jumlahAyat} Ayat
                </span>
              </div>

              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {surahDetail.namaLatin}
                <span class="text-base sm:text-lg font-normal text-slate-500 dark:text-slate-400 ml-2">
                  ({surahDetail.arti})
                </span>
              </h1>

              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {surahDetail.deskripsi}
              </p>
            </div>

            <!-- Arabic Surah Name Calligraphy -->
            <div class="text-right">
              <span class="font-arabic text-4xl sm:text-6xl text-emerald-700 dark:text-emerald-400 block leading-tight font-bold">
                {surahDetail.nama}
              </span>
            </div>
          </div>

          <!-- Reading Controls Toolbar -->
          <div class="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <!-- Navigation buttons -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                disabled={currentSurahNumber <= 1}
                onclick={() => navigateSurah(-1)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onclick={() => (appState.isSurahSelectorOpen = true)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors"
              >
                <Layers size={14} />
                <span>Pilih Surat</span>
              </button>

              <button
                type="button"
                disabled={currentSurahNumber >= 114}
                onclick={() => navigateSurah(1)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <!-- View Settings: Latin & Arabic Size -->
            <div class="flex items-center gap-2 sm:gap-3">
              <!-- Latin Toggle -->
              <button
                type="button"
                onclick={() => (appState.showLatin = !appState.showLatin)}
                class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors {appState.showLatin
                  ? 'bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-600/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}"
              >
                Latin: {appState.showLatin ? 'ON' : 'OFF'}
              </button>

              <!-- Font Size Selector -->
              <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs border border-slate-200 dark:border-slate-700/60">
                {#each ['sm', 'md', 'lg', 'xl'] as size}
                  <button
                    type="button"
                    onclick={() => (appState.arabicFontSize = size as any)}
                    class="px-2 py-1 rounded-lg uppercase font-bold text-[10px] transition-colors {appState.arabicFontSize === size
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Bismillah Calligraphy (except At-Taubah 9) -->
        {#if surahDetail.nomor !== 9}
          <div class="py-6 text-center">
            <div class="inline-block p-4 sm:p-6 rounded-3xl glass-card border border-emerald-500/20">
              <p class="font-arabic text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-300 leading-relaxed font-bold">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
              </p>
            </div>
          </div>
        {/if}

        <!-- Ayah List -->
        <div class="space-y-4">
          {#each surahDetail.ayat as ayah}
            <QuranCard
              {ayah}
              surahNomor={surahDetail.nomor}
              surahNamaLatin={surahDetail.namaLatin}
              isPlaying={appState.currentPlayingAyah?.nomorAyat === ayah.nomorAyat && appState.currentSurahNumber === surahDetail.nomor && appState.isPlaying}
              isBookmarked={appState.isAyahBookmarked(surahDetail.nomor, ayah.nomorAyat)}
              showLatin={appState.showLatin}
              arabicSize={appState.arabicFontSize}
              onPlayAudio={(a: Ayah) => appState.playAyah(a, surahDetail!.nomor, surahDetail!.namaLatin)}
              onToggleBookmark={(a: Ayah) => appState.toggleBookmark(a, surahDetail!.nomor, surahDetail!.namaLatin)}
              onOpenAsbabunNuzul={(asbab: AsbabunNuzulItem) => appState.openAsbabunNuzul(asbab)}
            />
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</div>
