<script lang="ts">
  import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Repeat1, ListMusic, ChevronDown, LoaderCircle } from 'lucide-svelte';
  import type { Ayah } from '../types/quran';
  import { appState } from '$lib/state/appState.svelte';
  import { SURAH_LIST } from '$lib/data/surahList';

  const reciters = [
    { id: '05', name: 'Misyari Rasyid Al-Afasy' },
    { id: '01', name: 'Abdullah Al-Juhany' },
    { id: '02', name: 'Abdul Muhsin Al-Qasim' },
    { id: '03', name: 'Abdurrahman As-Sudais' },
    { id: '04', name: 'Ibrahim Al-Dossari' }
  ];
  const repeatModes = ['none', 'ayah', 'surah'] as const;
  const currentReciter = $derived(reciters.find((r) => r.id === appState.selectedReciter)?.name ?? reciters[0].name);
  const queue = $derived(appState.getQueue(40));
  const totalAyahs = $derived(SURAH_LIST[appState.currentSurahNumber - 1]?.jumlahAyat ?? 0);
  const progress = $derived(appState.duration ? (appState.currentTime / appState.duration) * 100 : 0);
  function formatTime(time: number) {
    if (!Number.isFinite(time) || time < 0) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function retry() {
    if (appState.currentPlayingAyah) appState.playAyah(appState.currentPlayingAyah, appState.currentSurahNumber, appState.currentSurahName);
  }

  function cycleRepeat() {
    const i = repeatModes.indexOf(appState.repeatMode);
    appState.repeatMode = repeatModes[(i + 1) % repeatModes.length];
  }

  function selectQueueItem(item: { surahNumber: number; ayahNumber: number }) {
    appState.isQueueOpen = false;
    void appState.goToAyah(item.surahNumber, item.ayahNumber);
  }
</script>

{#if appState.currentPlayingAyah}
  <div class="player-dock" class:expanded={appState.isPlayerExpanded}>
    {#if appState.isPlayerExpanded}
      <div class="expanded-player" role="dialog" aria-modal="true" aria-label="Sedang diputar">
        <header class="expanded-header">
          <button type="button" class="icon-button" aria-label="Perkecil pemutar" onclick={() => (appState.isPlayerExpanded = false)}><ChevronDown size={21} /></button>
          <div><span class="eyebrow">QURAN SEARCH</span><strong>Sedang diputar</strong></div>
          <button type="button" class="icon-button" aria-label="Tutup pemutar" onclick={() => appState.stopAudio()}><X size={20} /></button>
        </header>

        <div class="player-body">
          <div class="quran-art" aria-hidden="true"><span class="art-ornament">۞</span><span class="art-surah font-arabic">{SURAH_LIST[appState.currentSurahNumber - 1]?.nama}</span><span class="art-label">AL-QUR'AN · {appState.currentSurahNumber} / 114</span></div>
          <div class="now-playing-info">
            <div><p class="eyebrow">SURAT {appState.currentSurahNumber} / 114</p><h1>{appState.currentSurahName}</h1><p>Ayat {appState.currentPlayingAyah.nomorAyat} dari {totalAyahs}</p></div>
            <label class="qari-select"><span>Qari</span><select aria-label="Pilih qari" value={appState.selectedReciter} onchange={(e) => appState.setReciter(e.currentTarget.value)}>{#each reciters as r}<option value={r.id}>{r.name}</option>{/each}</select></label>
          </div>
          <div class="surah-progress" aria-label="Kemajuan dalam surat"><span style={`width:${(appState.currentPlayingAyah.nomorAyat / totalAyahs) * 100}%`}></span></div>
          <p class="surah-progress-label">Ayat {appState.currentPlayingAyah.nomorAyat} dari {totalAyahs} · kemajuan surat</p>
          <div class="seek-row"><span>{formatTime(appState.currentTime)}</span><input type="range" min="0" max={appState.duration || 1} step="0.1" value={Math.min(appState.currentTime, appState.duration || 0)} aria-label="Posisi audio" oninput={(e) => appState.seek(Number(e.currentTarget.value))} /><span>{formatTime(appState.duration)}</span></div>
          {#if appState.audioError}<p class="error-message" role="status">{appState.audioError}<button type="button" onclick={retry}>Coba lagi</button></p>{/if}
          <div class="main-controls">
            <button type="button" class="icon-button repeat-control" class:active={appState.repeatMode !== 'none'} aria-label={`Mode ulang: ${appState.repeatMode}`} title={`Ulang: ${appState.repeatMode === 'none' ? 'Tidak ada' : appState.repeatMode === 'ayah' ? 'Ayat' : 'Surat'}`} onclick={cycleRepeat}><Repeat1 size={19} /><small>{appState.repeatMode === 'none' ? '∅' : appState.repeatMode === 'ayah' ? '1' : 'S'}</small></button>
            <button type="button" class="icon-button big-control" aria-label="Ayat sebelumnya" title="Ayat sebelumnya" disabled={appState.currentSurahNumber === 1 && appState.currentPlayingAyah.nomorAyat === 1} onclick={() => void appState.previousAyah()}><SkipBack size={22} fill="currentColor" /></button>
            <button type="button" class="play-button" aria-label={appState.isPlaying ? 'Jeda' : 'Putar'} onclick={() => appState.isPlaying ? appState.pauseAudio() : appState.resumeAudio()}>{#if appState.isAudioLoading}<LoaderCircle size={24} class="spinner" />{:else if appState.isPlaying}<Pause size={24} fill="currentColor" />{:else}<Play size={24} fill="currentColor" />{/if}</button>
            <button type="button" class="icon-button big-control" aria-label="Ayat berikutnya" title="Ayat berikutnya" disabled={appState.currentSurahNumber === 114 && appState.currentPlayingAyah.nomorAyat === totalAyahs} onclick={() => void appState.nextAyah()}><SkipForward size={22} fill="currentColor" /></button>
            <button type="button" class="icon-button repeat-control" aria-label="Buka antrean" title="Buka antrean" onclick={() => (appState.isQueueOpen = !appState.isQueueOpen)}><ListMusic size={20} /></button>
          </div>
          <div class="lower-controls">
            <button type="button" class="text-control" onclick={() => (appState.isQueueOpen = !appState.isQueueOpen)}><ListMusic size={17} /> Berikutnya</button>
            <label class="volume-control"><button type="button" class="icon-button" aria-label={appState.isMuted ? 'Nyalakan suara' : 'Bisukan'} onclick={() => appState.toggleMute()}>{#if appState.isMuted}<VolumeX size={18} />{:else}<Volume2 size={18} />{/if}</button><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={appState.isMuted ? 0 : appState.volume} oninput={(e) => appState.setVolume(Number(e.currentTarget.value))} /></label>
          </div>
          {#if appState.isQueueOpen}
            <section class="queue-panel" aria-label="Antrean ayat"><h2>Berikutnya</h2>{#if queue.length}<ol>{#each queue as item}<li><button type="button" onclick={() => selectQueueItem(item)}><span class="queue-number">{item.ayahNumber}</span><span><strong>{item.surahName}</strong><small>Surat {item.surahNumber} · Ayat {item.ayahNumber}</small></span><Play size={16} /></button></li>{/each}</ol>{:else}<p>Akhir bacaan Al-Qur'an.</p>{/if}</section>
          {/if}
        </div>
        <footer class="expanded-footer"><span>{currentReciter}</span><span>{appState.repeatMode === 'none' ? 'Tanpa pengulangan' : appState.repeatMode === 'ayah' ? 'Ulangi ayat' : 'Ulangi surat'}</span></footer>
      </div>
    {:else}
      <div class="compact-player">
        <button type="button" class="compact-info" aria-label="Buka pemutar lengkap" onclick={() => (appState.isPlayerExpanded = true)}>
          <span class="compact-mark"><span class="font-arabic">ق</span></span>
          <span class="compact-text"><strong>{appState.currentSurahName} · Ayat {appState.currentPlayingAyah.nomorAyat}</strong><small>{currentReciter}{#if appState.isAudioLoading} · Memuat…{:else if appState.audioError} · Terjadi kendala{/if}</small></span>
          <span class="compact-progress" style={`--progress:${progress}%`}></span>
        </button>
        <button type="button" class="compact-control" aria-label={appState.isPlaying ? 'Jeda' : 'Putar'} onclick={() => appState.isPlaying ? appState.pauseAudio() : appState.resumeAudio()}>{#if appState.isAudioLoading}<LoaderCircle size={21} class="spinner" />{:else if appState.isPlaying}<Pause size={20} fill="currentColor" />{:else}<Play size={20} fill="currentColor" />{/if}</button>
        <button type="button" class="compact-control next-compact" aria-label="Ayat berikutnya" onclick={() => void appState.nextAyah()}><SkipForward size={19} fill="currentColor" /></button>
        <button type="button" class="compact-control expand-compact" aria-label="Buka pemutar lengkap" onclick={() => (appState.isPlayerExpanded = true)}><ChevronDown size={20} class="up-chevron" /></button>
      </div>
      {#if appState.audioError}<div class="compact-error" role="status">{appState.audioError}<button type="button" onclick={retry}>Coba lagi</button></div>{/if}
    {/if}
  </div>
{/if}

<style>
  .player-dock { position: fixed; z-index: 45; left: 50%; bottom: 88px; transform: translateX(-50%); width: min(920px, calc(100% - 32px)); color: #e9f0eb; }
  .compact-player { position: relative; display: flex; align-items: center; gap: 9px; min-height: 68px; padding: 8px 12px; border: 1px solid #35473c; border-radius: 16px; background: #19241e; box-shadow: 0 12px 35px #08120d50; }
  .compact-info { position: relative; flex: 1; display: flex; align-items: center; gap: 11px; min-width: 0; height: 48px; padding: 0; text-align: left; color: inherit; background: transparent; border: 0; cursor: pointer; overflow: hidden; }
  .compact-mark { flex: none; display: grid; place-items: center; width: 43px; height: 43px; color: #bad2c2; background: #2a3d31; border-radius: 12px; font-size: 22px; }
  .compact-text { display: grid; gap: 3px; min-width: 0; padding-bottom: 2px; }
  .compact-text strong { overflow: hidden; color: #f0f4f1; font-size: 12px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
  .compact-text small { overflow: hidden; color: #a9b9ae; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .compact-progress { position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(to right,#84b397 var(--progress),#ffffff19 var(--progress)); }
  .compact-control,.icon-button { display: grid; place-items: center; flex: none; width: 42px; height: 42px; color: #dce7df; border: 0; border-radius: 12px; background: transparent; cursor: pointer; }
  .compact-control:hover,.icon-button:hover { color: #fff; background: #ffffff12; }
  .compact-control:disabled,.icon-button:disabled { opacity: .35; cursor: not-allowed; }
  .expanded { position: fixed; inset: 0; z-index: 80; width: 100%; height: 100dvh; transform: none; left: 0; bottom: auto; overflow: auto; background: #111a15; }
  .expanded-player { min-height: 100%; display: flex; flex-direction: column; background: radial-gradient(ellipse at 50% 5%,#293b30 0%,#17221b 45%,#111a15 100%); }
  .expanded-header { position: sticky; top: 0; z-index: 2; min-height: 66px; display: grid; grid-template-columns: 48px 1fr 48px; align-items: center; padding: 6px max(16px,env(safe-area-inset-left)) 6px max(16px,env(safe-area-inset-right)); background: #17221be8; backdrop-filter: blur(12px); }
  .expanded-header > div { display: grid; justify-items: center; gap: 2px; }.expanded-header strong { font-size: 13px; }.eyebrow { margin: 0; color: #a5bdad; font-size: 9px; font-weight: 700; letter-spacing: .13em; }
  .player-body { width: min(500px,100%); margin: 0 auto; padding: 18px 22px 24px; }
  .quran-art { display: grid; place-content: center; justify-items: center; gap: 18px; width: min(72vw,320px); aspect-ratio: 1; margin: 4px auto 25px; border: 1px solid #b2cbb51c; border-radius: 50%; background: radial-gradient(circle,#34483a 0,#273b2e 45%,#1d2c22 72%,#17231b 73%); box-shadow: 0 20px 70px #080d09a0,inset 0 0 32px #d5efda0b; }
  .art-ornament { color: #98b8a0; font-size: 34px; }.art-surah { color: #e4eee6; font-size: clamp(35px,9vw,55px); }.art-label { color: #9bb1a1; font-size: 9px; letter-spacing: .16em; }
  .now-playing-info { display: flex; align-items: end; justify-content: space-between; gap: 14px; }.now-playing-info h1 { margin: 6px 0 3px; font-size: 24px; font-weight: 650; letter-spacing: -.04em; }.now-playing-info p:last-child { margin: 0; color: #adbbb0; font-size: 13px; }
  .qari-select { display: grid; gap: 5px; max-width: 48%; color: #a9b9ae; font-size: 10px; }.qari-select select { max-width: 100%; color: #e3ece5; background: #ffffff10; border: 1px solid #ffffff20; border-radius: 9px; padding: 8px; font: inherit; font-size: 11px; }.qari-select option { color: #202a25; }
  .surah-progress { height: 3px; margin-top: 23px; overflow: hidden; border-radius: 4px; background: #ffffff19; }.surah-progress span { display: block; height: 100%; background: #8bb99a; }.surah-progress-label { margin: 7px 0 0; color: #8fa296; text-align: center; font-size: 10px; }
  .seek-row { display: flex; align-items: center; gap: 10px; margin-top: 20px; color: #adbbb0; font-size: 10px; font-variant-numeric: tabular-nums; }.seek-row input { flex: 1; min-width: 0; height: 28px; accent-color: #90b99d; cursor: pointer; touch-action: pan-x; }
  .main-controls { display: flex; align-items: center; justify-content: center; gap: clamp(9px,4vw,22px); margin-top: 7px; }.big-control { width: 48px; height: 48px; }.play-button { display: grid; place-items: center; width: 62px; height: 62px; color: #1b2a20; border: 0; border-radius: 50%; background: #b8d1bd; cursor: pointer; }.play-button:hover { background: #d0e2d3; transform: scale(1.03); }.repeat-control { position: relative; color: #b6c6ba; }.repeat-control.active { color: #a8d0b2; }.repeat-control small { position: absolute; right: 7px; bottom: 7px; font-size: 9px; font-weight: 700; }
  .lower-controls { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }.text-control { display: flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 10px; color: #b7c7bb; background: transparent; border: 0; cursor: pointer; }.volume-control { display: flex; align-items: center; gap: 5px; }.volume-control input { width: 84px; accent-color: #90b99d; }
  .expanded-footer { display: flex; justify-content: center; gap: 9px; margin-top: auto; padding: 15px 12px max(18px,env(safe-area-inset-bottom)); color: #889d8f; font-size: 10px; }.expanded-footer span+span::before { content: '·'; margin-right: 9px; }
  .queue-panel { margin: 20px -10px 0; padding: 16px 12px 12px; border: 1px solid #ffffff18; border-radius: 16px; background: #10191299; }.queue-panel h2 { margin: 0 0 9px; color: #e7eee9; font-size: 15px; }.queue-panel ol { max-height: 32vh; overflow: auto; margin: 0; padding: 0; list-style: none; }.queue-panel li button { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 6px; color: #dce7df; text-align: left; border: 0; border-bottom: 1px solid #ffffff0d; background: none; cursor: pointer; }.queue-panel li button:hover { background: #ffffff0b; }.queue-number { display: grid; place-items: center; width: 32px; height: 32px; color: #abc7b3; border-radius: 9px; background: #ffffff0d; font-size: 11px; }.queue-panel li button > span:nth-child(2) { display: grid; flex: 1; gap: 3px; }.queue-panel strong { font-size: 12px; font-weight: 600; }.queue-panel small,.queue-panel > p { color: #91a398; font-size: 10px; }.error-message,.compact-error { display: flex; justify-content: center; align-items: center; gap: 9px; color: #f0b7a8; font-size: 12px; }.error-message button,.compact-error button { color: #e7d4bd; border: 0; background: none; text-decoration: underline; cursor: pointer; }.compact-error { position: absolute; bottom: calc(100% + 6px); left: 0; width: 100%; padding: 8px; border: 1px solid #503d32; border-radius: 10px; background: #2b211c; font-size: 11px; }:global(.spinner) { animation: spin 1s linear infinite; }@keyframes spin { to { transform: rotate(360deg); } }
  @media (min-width: 768px) { .player-dock { bottom: 18px; }.compact-player { min-height: 76px; padding: 10px 18px; }.compact-info { max-width: 380px; }.compact-mark { width: 48px; height: 48px; }.next-compact { margin-right: 3px; }.expanded-header { min-height: 74px; }.quran-art { margin-top: 18px; }.player-body { padding-top: 18px; }.volume-control input { width: 110px; } }
  @media (max-width: 420px) { .player-dock { left: 0; bottom: calc(74px + env(safe-area-inset-bottom,0px)); width: 100%; transform: none; padding: 0 8px; }.compact-player { min-height: 61px; padding: 5px 7px; gap: 3px; border-radius: 13px; }.compact-mark { width: 37px; height: 37px; }.compact-control { width: 37px; height: 40px; }.expand-compact { display: none; }.compact-text strong { font-size: 11px; }.compact-text small { font-size: 9px; }.expanded { padding: 0; }.player-body { padding-top: 12px; }.quran-art { width: min(65vw,275px); margin-bottom: 19px; } }
  @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
</style>
