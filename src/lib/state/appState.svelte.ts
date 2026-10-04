import type { Ayah, AsbabunNuzulItem, BookmarkItem, SurahInfo } from '../types/quran';
import { quranService } from '../services/quranService';
import { SURAH_LIST } from '../data/surahList';

export type RepeatMode = 'none' | 'ayah' | 'surah';
export interface LastReadPosition {
  surahNomor: number;
  surahNamaLatin: string;
  ayatNomor: number;
  updatedAt: number;
}
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

class AppStateManager {
  // Theme state
  theme = $state<'dark' | 'light'>('dark');

  // Global Audio Playback
  currentPlayingAyah = $state<Ayah | null>(null);
  currentSurahNumber = $state<number>(1);
  currentSurahName = $state<string>('Al-Fatihah');
  isPlaying = $state<boolean>(false);
  audioElement: HTMLAudioElement | null = null;
  selectedReciter = $state<string>('05'); // 05 = Misyari Rasyid Al-Afasy
  duration = $state(0);
  currentTime = $state(0);
  repeatMode = $state<RepeatMode>('none');
  isAudioLoading = $state(false);
  audioError = $state('');
  volume = $state(0.8);
  isMuted = $state(false);
  isPlayerExpanded = $state(false);
  isQueueOpen = $state(false);
  installPrompt = $state<InstallPrompt | null>(null);
  updateWorker = $state<ServiceWorker | null>(null);
  updateAvailable = $state(false);
  private navigationToken = 0;

  // Modals state
  isSurahSelectorOpen = $state<boolean>(false);
  isBookmarksOpen = $state<boolean>(false);
  selectedAsbabunNuzul = $state<AsbabunNuzulItem | null>(null);
  isAsbabunNuzulModalOpen = $state<boolean>(false);

  // User Settings
  arabicFontSize = $state<'sm' | 'md' | 'lg' | 'xl'>('lg');
  showLatin = $state<boolean>(true);
  bookmarks = $state<BookmarkItem[]>([]);
  lastRead = $state<LastReadPosition | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      this.bookmarks = quranService.getBookmarks();
      this.lastRead = this.getLastRead();
      this.initTheme();
    }
  }

  initTheme() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('quran_theme');
      if (stored === 'dark' || stored === 'light') {
        this.theme = stored;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme = prefersDark ? 'dark' : 'light';
      }
      this.applyTheme(this.theme);
    } catch {
      this.theme = 'dark';
      this.applyTheme('dark');
    }
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.theme = nextTheme;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quran_theme', nextTheme);
      } catch {}
      this.applyTheme(nextTheme);
    }
  }

  private getLastRead(): LastReadPosition | null {
    try {
      const raw = localStorage.getItem('quran_last_read');
      if (!raw) return null;
      const position = JSON.parse(raw) as LastReadPosition;
      const surah = SURAH_LIST[position.surahNomor - 1];
      if (!surah || !Number.isInteger(position.ayatNomor) || position.ayatNomor < 1 || position.ayatNomor > surah.jumlahAyat) return null;
      return { ...position, surahNamaLatin: surah.namaLatin };
    } catch {
      return null;
    }
  }

  saveLastRead(surahNomor: number, ayatNomor: number) {
    const surah = SURAH_LIST[surahNomor - 1];
    if (!surah || !Number.isInteger(ayatNomor) || ayatNomor < 1 || ayatNomor > surah.jumlahAyat) return;
    if (this.lastRead?.surahNomor === surahNomor && this.lastRead.ayatNomor === ayatNomor) return;
    const position = { surahNomor, surahNamaLatin: surah.namaLatin, ayatNomor, updatedAt: Date.now() };
    this.lastRead = position;
    try {
      localStorage.setItem('quran_last_read', JSON.stringify(position));
    } catch {
      // Keep the in-memory position when browser storage is unavailable.
    }
  }

  async installApp() {
    if (!this.installPrompt) return;
    const prompt = this.installPrompt;
    this.installPrompt = null;
    await prompt.prompt();
    await prompt.userChoice;
  }

  activateUpdate() {
    if (this.currentPlayingAyah) return;
    this.updateWorker?.postMessage({ type: 'SKIP_WAITING' });
  }

  private applyTheme(theme: 'dark' | 'light') {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }

  playAyah(ayah: Ayah, surahNomor: number, surahNamaLatin: string) {
    if (this.currentPlayingAyah?.nomorAyat === ayah.nomorAyat && this.currentSurahNumber === surahNomor) {
      if (this.isPlaying) {
        this.pauseAudio();
      } else {
        this.resumeAudio();
      }
      return;
    }

    this.navigationToken++;
    this.currentPlayingAyah = ayah;
    this.currentSurahNumber = surahNomor;
    this.currentSurahName = surahNamaLatin;

    // Determine audio url
    const audioUrl = ayah.audio?.[this.selectedReciter] || Object.values(ayah.audio || {})[0];
    if (!audioUrl) { this.audioError = 'Audio ayat ini tidak tersedia untuk qari yang dipilih.'; this.isPlaying = false; return; }

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.onended = () => { void this.advanceAfterEnd(); };
      this.audioElement.onerror = () => { this.isPlaying = false; this.isAudioLoading = false; this.audioError = 'Gagal memutar audio. Periksa koneksi lalu coba lagi.'; };
      this.audioElement.ontimeupdate = () => { if (this.audioElement) this.currentTime = this.audioElement.currentTime; };
      this.audioElement.onpause = () => { this.isPlaying = false; };
      this.audioElement.onloadedmetadata = () => { if (this.audioElement) this.duration = Number.isFinite(this.audioElement.duration) ? this.audioElement.duration : 0; this.isAudioLoading = false; };
      this.audioElement.onwaiting = () => { this.isAudioLoading = true; };
      this.audioElement.onplaying = () => { this.isAudioLoading = false; this.audioError = ''; };
    }

    this.audioElement.volume = this.isMuted ? 0 : this.volume;
    this.isAudioLoading = true;
    this.audioError = '';
    this.currentTime = 0;
    this.duration = 0;
    this.audioElement.src = audioUrl;
    this.audioElement.play()
      .then(() => {
        this.isPlaying = true;
        this.isAudioLoading = false;
      })
      .catch((err) => {
        console.warn('Playback error:', err);
        this.isPlaying = false;
        this.isAudioLoading = false;
        this.audioError = 'Gagal memutar audio. Coba putar kembali.';
      });
  }

  pauseAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }

  resumeAudio() {
    if (this.audioElement && this.audioElement.src) {
      this.audioElement.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(() => {
          this.isPlaying = false;
          this.audioError = 'Gagal memutar audio. Coba putar kembali.';
        });
    }
  }

  stopAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.isPlaying = false;
    this.isAudioLoading = false;
    this.audioError = '';
    this.currentTime = 0;
    this.duration = 0;
    this.currentPlayingAyah = null;
  }

  seek(seconds: number) {
    if (!this.audioElement || !Number.isFinite(seconds)) return;
    this.audioElement.currentTime = Math.max(0, Math.min(this.duration || seconds, seconds));
    this.currentTime = this.audioElement.currentTime;
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    this.isMuted = this.volume === 0;
    if (this.audioElement) this.audioElement.volume = this.isMuted ? 0 : this.volume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioElement) this.audioElement.volume = this.isMuted ? 0 : this.volume;
  }

  setReciter(id: string) {
    this.selectedReciter = id;
    if (this.currentPlayingAyah) {
      const { currentPlayingAyah, currentSurahNumber, currentSurahName, isPlaying } = this;
      this.playAyah(currentPlayingAyah, currentSurahNumber, currentSurahName);
      if (!isPlaying) this.pauseAudio();
    }
  }

  private async getAyah(surahNumber: number, ayahNumber: number): Promise<Ayah | null> {
    const detail = await quranService.getSurahDetail(surahNumber);
    return detail.ayat.find((ayah) => ayah.nomorAyat === ayahNumber) ?? null;
  }

  async goToAyah(surahNumber: number, ayahNumber: number) {
    const token = ++this.navigationToken;
    this.audioError = '';
    this.isAudioLoading = true;
    try {
      const ayah = await this.getAyah(surahNumber, ayahNumber);
      if (token !== this.navigationToken || !ayah) return;
      this.playAyah(ayah, surahNumber, SURAH_LIST[surahNumber - 1]?.namaLatin ?? `Surat ${surahNumber}`);
    } catch {
      if (token === this.navigationToken) { this.isAudioLoading = false; this.audioError = 'Ayat berikutnya tidak dapat dimuat. Coba lagi.'; }
    }
  }

  async nextAyah() {
    if (!this.currentPlayingAyah) return;
    const surah = this.currentSurahNumber;
    const ayah = this.currentPlayingAyah.nomorAyat;
    const total = SURAH_LIST[surah - 1]?.jumlahAyat ?? 0;
    if (ayah < total) return this.goToAyah(surah, ayah + 1);
    if (surah < 114) return this.goToAyah(surah + 1, 1);
    this.stopAudio();
  }

  async previousAyah() {
    if (!this.currentPlayingAyah) return;
    const surah = this.currentSurahNumber;
    const ayah = this.currentPlayingAyah.nomorAyat;
    if (ayah > 1) return this.goToAyah(surah, ayah - 1);
    if (surah > 1) return this.goToAyah(surah - 1, SURAH_LIST[surah - 2].jumlahAyat);
  }

  private async advanceAfterEnd() {
    if (!this.currentPlayingAyah) return;
    if (this.repeatMode === 'ayah') return this.goToAyah(this.currentSurahNumber, this.currentPlayingAyah.nomorAyat);
    if (this.repeatMode === 'surah' && this.currentPlayingAyah.nomorAyat === (SURAH_LIST[this.currentSurahNumber - 1]?.jumlahAyat ?? 0)) {
      return this.goToAyah(this.currentSurahNumber, 1);
    }
    if (this.currentSurahNumber === 114 && this.currentPlayingAyah.nomorAyat === SURAH_LIST[113].jumlahAyat) return this.stopAudio();
    await this.nextAyah();
  }

  getQueue(limit = 30): { surahNumber: number; surahName: string; ayahNumber: number }[] {
    if (!this.currentPlayingAyah) return [];
    const queue = [];
    let surahNumber = this.currentSurahNumber;
    let ayahNumber = this.currentPlayingAyah.nomorAyat + 1;
    while (queue.length < limit && surahNumber <= 114) {
      const info = SURAH_LIST[surahNumber - 1];
      if (ayahNumber > info.jumlahAyat) { surahNumber++; ayahNumber = 1; continue; }
      queue.push({ surahNumber, surahName: info.namaLatin, ayahNumber });
      ayahNumber++;
    }
    return queue;
  }

  openAsbabunNuzul(item: AsbabunNuzulItem) {
    this.selectedAsbabunNuzul = item;
    this.isAsbabunNuzulModalOpen = true;
  }

  closeAsbabunNuzul() {
    this.isAsbabunNuzulModalOpen = false;
    this.selectedAsbabunNuzul = null;
  }

  toggleBookmark(ayah: Ayah, surahNomor: number, surahNamaLatin: string) {
    const isSaved = quranService.toggleBookmark({
      surahNomor,
      surahNamaLatin,
      ayatNomor: ayah.nomorAyat,
      teksArab: ayah.teksArab,
      teksIndonesia: ayah.teksIndonesia
    });
    this.bookmarks = quranService.getBookmarks();
    return isSaved;
  }

  removeBookmark(b: BookmarkItem) {
    quranService.toggleBookmark({
      surahNomor: b.surahNomor,
      surahNamaLatin: b.surahNamaLatin,
      ayatNomor: b.ayatNomor,
      teksArab: b.teksArab,
      teksIndonesia: b.teksIndonesia
    });
    this.bookmarks = quranService.getBookmarks();
  }

  isAyahBookmarked(surahNomor: number, ayatNomor: number): boolean {
    return this.bookmarks.some((b) => b.surahNomor === surahNomor && b.ayatNomor === ayatNomor);
  }
}

export const appState = new AppStateManager();
