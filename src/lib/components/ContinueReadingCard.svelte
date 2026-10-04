<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowRight, BookOpen } from 'lucide-svelte';
  import { appState } from '$lib/state/appState.svelte';

  let { compact = false }: { compact?: boolean } = $props();

  function continueReading() {
    const position = appState.lastRead;
    if (position) void goto(`/dashboard?surah=${position.surahNomor}#ayah-${position.surahNomor}-${position.ayatNomor}`);
    else void goto('/dashboard?surah=1');
  }
</script>

<section class="continue-reading" class:compact aria-labelledby="last-read-title">
  <div class="heading-row">
    <h2 id="last-read-title">Terakhir dibaca</h2>
    {#if appState.lastRead}
      <span class="read-time">Ayat {appState.lastRead.ayatNomor}</span>
    {/if}
  </div>
  <button type="button" class="continue-card" onclick={continueReading}>
    <span class="book-icon"><BookOpen size={19} aria-hidden="true" /></span>
    <span class="read-detail">
      <strong>{appState.lastRead?.surahNamaLatin ?? 'Mulai membaca Al-Qur’an'}</strong>
      <span>{appState.lastRead ? `Surat ${appState.lastRead.surahNomor} · Ayat ${appState.lastRead.ayatNomor}` : 'Lanjutkan dengan membaca surat pertama.'}</span>
    </span>
    <span class="continue-action">{appState.lastRead ? 'Lanjutkan membaca' : 'Mulai membaca'} <ArrowRight size={15} aria-hidden="true" /></span>
  </button>
</section>

<style>
  .continue-reading { max-width: 48rem; margin: 1.5rem auto 0; }
  .heading-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:9px; }
  h2 { margin:0; color:var(--text-main); font-size:14px; font-weight:650; }
  .read-time { color:var(--text-muted); font-size:12px; }
  .continue-card { display:flex; align-items:center; gap:12px; width:100%; min-height:64px; padding:10px 12px; text-align:left; border:1px solid var(--border-color); border-radius:14px; background:var(--bg-secondary); cursor:pointer; }
  .continue-card:hover { border-color:#83ac96; }
  .book-icon { display:grid; place-items:center; flex:none; width:38px; height:38px; color:#28684f; border-radius:11px; background:#e3eee7; }
  :global(.dark) .book-icon { color:#a1c9b3; background:#243c31; }
  .read-detail { display:grid; gap:3px; min-width:0; flex:1; }
  .read-detail strong { overflow:hidden; color:var(--text-main); font-size:13px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
  .read-detail span { color:var(--text-muted); font-size:11px; }
  .continue-action { display:flex; align-items:center; gap:5px; flex:none; color:#28684f; font-size:11px; font-weight:650; }
  :global(.dark) .continue-action { color:#a1c9b3; }
  .continue-card:focus-visible { outline:3px solid #64a788; outline-offset:3px; }
  .compact { margin-top:1.5rem; }
  .compact .continue-card { min-height:56px; }
  @media(max-width:370px) { .continue-action { max-width:75px; text-align:right; line-height:1.25; } }
</style>
