<script lang="ts">
  import { Search, X } from 'lucide-svelte';

  interface Props {
    searchQuery: string;
    activeFilterTag?: string;
    isFocused?: boolean;
    onSearchChange?: (val: string) => void;
    onTagSelect?: (tag: string) => void;
    onFocusChange?: (focused: boolean) => void;
    placeholder?: string;
  }

  let {
    searchQuery = $bindable(''),
    activeFilterTag = $bindable(''),
    isFocused = $bindable(false),
    onSearchChange,
    onTagSelect,
    onFocusChange,
    placeholder = 'Cari surat, ayat, atau tema...'
  }: Props = $props();

  const quickTags = [
    { label: 'Juz 30', query: 'juz 30' },
    { label: 'Al-Kahfi', query: 'Al-Kahf' },
    { label: 'Al-Baqarah', query: 'Al-Baqarah' },
    { label: 'Yasin', query: 'Yasin' },
  ];

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;
    activeFilterTag = '';
    onSearchChange?.(target.value);
  }

  function handleFocus() {
    isFocused = true;
    onFocusChange?.(true);
  }

  function handleBlur() {
    if (!searchQuery) {
      isFocused = false;
      onFocusChange?.(false);
    }
  }

  function clearSearch() {
    searchQuery = '';
    activeFilterTag = '';
    isFocused = false;
    onSearchChange?.('');
    onFocusChange?.(false);
  }

  function handleTagClick(tag: { label: string; query: string }) {
    if (activeFilterTag === tag.label) {
      clearSearch();
      return;
    }

    activeFilterTag = tag.label;
    searchQuery = tag.query;
    isFocused = true;
    onSearchChange?.(tag.query);
    onFocusChange?.(true);
    onTagSelect?.(tag.label);
  }
</script>

<div class="w-full max-w-2xl mx-auto space-y-3">
  <div class="relative rounded-2xl border border-slate-300/90 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-emerald-600/70 dark:focus-within:border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-600/10 dark:focus-within:ring-emerald-400/10">
    <div class="flex min-h-[58px] sm:min-h-[64px] items-center px-4 sm:px-5">
      <Search size={20} class="mr-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      <input
        type="search"
        value={searchQuery}
        oninput={handleInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={(e) => {
          if (e.key === 'Escape') clearSearch();
        }}
        {placeholder}
        aria-label="Cari Al-Qur'an"
        class="w-full bg-transparent text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
      />
      {#if searchQuery}
        <button
          type="button"
          onclick={clearSearch}
          class="ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          title="Hapus pencarian"
          aria-label="Hapus pencarian"
        >
          <X size={18} />
        </button>
      {/if}
    </div>
  </div>

  <div class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 py-1 text-xs">
    <span class="shrink-0 text-slate-500 dark:text-slate-400">Pencarian populer</span>
    <span class="shrink-0 text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
    <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
      {#each quickTags as tag, i}
        {#if i > 0}<span class="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>{/if}
        <button
          type="button"
          onclick={() => handleTagClick(tag)}
          aria-pressed={activeFilterTag === tag.label}
          class="whitespace-nowrap underline decoration-transparent underline-offset-4 transition-colors hover:text-emerald-700 hover:decoration-emerald-600 dark:hover:text-emerald-300 dark:hover:decoration-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm"
        >{tag.label}</button>
      {/each}
    </div>
  </div>
</div>
