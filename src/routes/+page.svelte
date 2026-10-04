<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowRight, BookOpen, Bookmark, Headphones, Search, ScrollText } from 'lucide-svelte';
  import ContinueReadingCard from '$lib/components/ContinueReadingCard.svelte';
  import { appState } from '$lib/state/appState.svelte';
</script>

<div class="home-shell mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 sm:pt-12 lg:px-8">
  <section class="home-welcome">
    <p class="eyebrow">RUANG BACA AL-QUR'AN</p>
    <h1>Assalamu’alaikum</h1>
    <p class="welcome-copy">Mulai dari ayat yang ingin Anda baca, cari, dengarkan, atau pahami hari ini.</p>
  </section>

  <section class="home-search" aria-label="Cari Al-Qur'an">
    <button type="button" class="home-search-button" onclick={() => goto('/dashboard?search=1')}>
      <Search size={19} />
      <span>Cari surat, ayat, terjemahan, atau tema…</span>
      <ArrowRight size={17} class="search-arrow" />
    </button>
    <p>Telusuri ayat Al-Qur'an dan Asbabun Nuzul dalam satu pencarian.</p>
  </section>

  <ContinueReadingCard />

  <section class="home-quicklinks" aria-label="Jelajahi fitur">
    <button type="button" onclick={() => goto('/dashboard?surah=1')}>
      <span class="quick-icon"><BookOpen size={19} /></span><span><strong>Baca Al-Qur’an</strong><small>114 surat dan terjemahan</small></span><ArrowRight size={16} />
    </button>
    <button type="button" onclick={() => goto('/murottal')}>
      <span class="quick-icon"><Headphones size={19} /></span><span><strong>Dengarkan murottal</strong><small>Pilih qari dan surat</small></span><ArrowRight size={16} />
    </button>
    <button type="button" onclick={() => goto('/dashboard?mode=asbabun_nuzul')}>
      <span class="quick-icon"><ScrollText size={19} /></span><span><strong>Pelajari konteks ayat</strong><small>Asbabun Nuzul dan riwayat</small></span><ArrowRight size={16} />
    </button>
    <button type="button" onclick={() => (appState.isBookmarksOpen = true)}>
      <span class="quick-icon"><Bookmark size={19} /></span><span><strong>Ayat tersimpan</strong><small>{appState.bookmarks.length ? `${appState.bookmarks.length} ayat dalam koleksi` : 'Buka koleksi penanda ayat'}</small></span><ArrowRight size={16} />
    </button>
  </section>

  <footer class="home-footer"><span>114 surat</span><i></i><span>6.236 ayat</span><i></i><span>5 pilihan qari</span></footer>
</div>

<style>
  .home-shell { max-width: 980px; }
  .home-welcome { padding: 15px 0 28px; }
  .eyebrow { margin: 0 0 9px; color: #668078; font-size: 10px; font-weight: 750; letter-spacing: .14em; }
  :global(.dark) .eyebrow { color: #94aaa1; }
  h1 { margin: 0; font-size: clamp(27px, 5vw, 38px); letter-spacing: -.045em; line-height: 1.15; font-weight: 650; color: var(--text-main); }
  .welcome-copy { margin: 10px 0 0; max-width: 560px; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
  .home-search { padding: 20px; border: 1px solid var(--border-color); border-radius: 18px; background: var(--bg-secondary); }
  .home-search-button { width: 100%; min-height: 56px; display: flex; align-items: center; gap: 13px; padding: 0 16px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-muted); text-align: left; cursor: pointer; }
  .home-search-button :global(svg:first-child) { color: #32745e; flex: none; }
  .home-search-button span { flex: 1; font-size: 14px; }
  :global(.search-arrow) { color: #71867e; }
  .home-search-button:hover { border-color: #76a993; }
  .home-search-button:focus-visible, .home-quicklinks button:focus-visible { outline: 3px solid #64a788; outline-offset: 3px; }
  .home-search > p { margin: 11px 2px 0; font-size: 12px; color: var(--text-muted); }
  .home-quicklinks { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1px 28px; margin-top: 27px; border-top: 1px solid var(--border-color); }
  .home-quicklinks button { display: flex; align-items: center; gap: 13px; min-width: 0; min-height: 82px; padding: 12px 2px; text-align: left; color: var(--text-muted); background: none; border: 0; border-bottom: 1px solid var(--border-color); cursor: pointer; }
  .home-quicklinks button > span:nth-child(2) { display: grid; flex: 1; gap: 4px; }
  .home-quicklinks button > :global(svg:last-child) { color: #89988f; }
  .home-quicklinks strong { color: var(--text-main); font-size: 13px; font-weight: 650; }
  .home-quicklinks small { color: var(--text-muted); font-size: 11px; }
  .home-quicklinks button:hover strong { color: #32745e; }
  .home-footer { display: flex; justify-content: center; align-items: center; gap: 13px; padding: 26px 0 8px; color: var(--text-muted); font-size: 11px; }
  .home-footer i { width: 3px; height: 3px; border-radius: 50%; background: #9aaba2; }
  @media (max-width: 767px) { .home-quicklinks { display: none; } }
  @media (max-width: 600px) { .home-shell { padding-top: 20px; } .home-welcome { padding: 9px 0 22px; } .home-search { padding: 13px; border-radius: 15px; } .home-search-button { min-height: 52px; padding: 0 12px; gap: 9px; } .home-search-button span { font-size: 12px; } }
  @media (prefers-reduced-motion: reduce) { *,*::before,*::after { transition-duration: .01ms !important; } }
</style>
