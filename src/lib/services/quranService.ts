import { SURAH_LIST } from '../data/surahList';
import { ASBABUN_NUZUL_DATABASE } from '../data/asbabunNuzulData';
import type { SurahInfo, SurahDetail, Ayah, AsbabunNuzulItem, SearchFilter, SearchMatch, BookmarkItem } from '../types/quran';

// Client-side cache
const surahCache = new Map<number, SurahDetail>();
const tafsirCache = new Map<number, any>();
let semanticSearchController: AbortController | null = null;
let semanticSearchRequest = 0;

function cancelSemanticSearch() {
  semanticSearchRequest += 1;
  semanticSearchController?.abort();
  semanticSearchController = null;
}

export const quranService = {
  cancelSemanticSearch,
  /**
   * Get list of all 114 surahs
   */
  getSurahList(): SurahInfo[] {
    return SURAH_LIST;
  },

  /**
   * Get metadata for single surah
   */
  getSurahInfo(nomor: number): SurahInfo | undefined {
    return SURAH_LIST.find((s) => s.nomor === nomor);
  },

  /**
   * Fetch complete surah with verses and Asbabun Nuzul enrichment
   */
  async getSurahDetail(surahNomor: number): Promise<SurahDetail> {
    if (surahCache.has(surahNomor)) {
      return surahCache.get(surahNomor)!;
    }

    try {
      // Use internal SvelteKit endpoint first
      const res = await fetch(`/api/surah/${surahNomor}`);
      if (!res.ok) {
        throw new Error(`Gagal mengambil data surat (${res.status})`);
      }
      const json = await res.json();
      const rawData = json.data || json;

      // Enrich verses with Asbabun Nuzul
      const enrichedAyat: Ayah[] = (rawData.ayat || []).map((ayat: any) => {
        const asbab = ASBABUN_NUZUL_DATABASE.find((item) => {
          if (item.surahNomor !== surahNomor) return false;
          if (typeof item.ayatNomor === 'number') {
            return item.ayatNomor === ayat.nomorAyat;
          }
          if (typeof item.ayatNomor === 'string') {
            const [start, end] = item.ayatNomor.split('-').map(Number);
            return ayat.nomorAyat >= start && ayat.nomorAyat <= end;
          }
          return false;
        });

        return {
          nomorAyat: ayat.nomorAyat,
          teksArab: ayat.teksArab,
          teksLatin: ayat.teksLatin,
          teksIndonesia: ayat.teksIndonesia,
          audio: ayat.audio || {},
          surahNumber: surahNomor,
          surahLatin: rawData.namaLatin,
          asbabunNuzul: asbab
        };
      });

      const detail: SurahDetail = {
        nomor: rawData.nomor,
        nama: rawData.nama,
        namaLatin: rawData.namaLatin,
        jumlahAyat: rawData.jumlahAyat,
        tempatTurun: rawData.tempatTurun,
        arti: rawData.arti,
        deskripsi: rawData.deskripsi,
        audioFull: rawData.audioFull,
        ayat: enrichedAyat,
        suratSelanjutnya: rawData.suratSelanjutnya,
        suratSebelumnya: rawData.suratSebelumnya
      };

      surahCache.set(surahNomor, detail);
      return detail;
    } catch (err) {
      console.warn(`Fallback fetch for surah ${surahNomor}:`, err);
      // Fallback: try external direct if local proxy fails
      const directRes = await fetch(`https://equran.id/api/v2/surat/${surahNomor}`);
      const directJson = await directRes.json();
      const raw = directJson.data;

      const enrichedAyat: Ayah[] = (raw.ayat || []).map((ayat: any) => ({
        nomorAyat: ayat.nomorAyat,
        teksArab: ayat.teksArab,
        teksLatin: ayat.teksLatin,
        teksIndonesia: ayat.teksIndonesia,
        audio: ayat.audio || {},
        surahNumber: surahNomor,
        surahLatin: raw.namaLatin,
        asbabunNuzul: ASBABUN_NUZUL_DATABASE.find((i) => i.surahNomor === surahNomor && (i.ayatNomor === ayat.nomorAyat || String(i.ayatNomor).includes(String(ayat.nomorAyat))))
      }));

      const fallbackDetail: SurahDetail = {
        nomor: raw.nomor,
        nama: raw.nama,
        namaLatin: raw.namaLatin,
        jumlahAyat: raw.jumlahAyat,
        tempatTurun: raw.tempatTurun,
        arti: raw.arti,
        deskripsi: raw.deskripsi,
        audioFull: raw.audioFull,
        ayat: enrichedAyat,
        suratSelanjutnya: raw.suratSelanjutnya,
        suratSebelumnya: raw.suratSebelumnya
      };

      surahCache.set(surahNomor, fallbackDetail);
      return fallbackDetail;
    }
  },

  /**
   * Fetch Tafsir & Asbabun Nuzul details from Kemenag
   */
  async getTafsir(surahNomor: number) {
    if (tafsirCache.has(surahNomor)) {
      return tafsirCache.get(surahNomor);
    }
    try {
      const res = await fetch(`/api/tafsir/${surahNomor}`);
      const data = await res.json();
      tafsirCache.set(surahNomor, data.data || data);
      return data.data || data;
    } catch (e) {
      console.warn('Tafsir fetch error:', e);
      return null;
    }
  },

  /**
   * Get all Asbabun Nuzul entries with optional keyword filtering
   */
  getAsbabunNuzulList(filterQuery?: string): AsbabunNuzulItem[] {
    if (!filterQuery || !filterQuery.trim()) {
      return ASBABUN_NUZUL_DATABASE;
    }
    const q = filterQuery.toLowerCase();
    return ASBABUN_NUZUL_DATABASE.filter(
      (item) =>
        item.surahNama.toLowerCase().includes(q) ||
        item.tema.toLowerCase().includes(q) ||
        item.kisah.toLowerCase().includes(q) ||
        item.riwayat.toLowerCase().includes(q) ||
        item.sumber.toLowerCase().includes(q) ||
        String(item.surahNomor) === q
    );
  },

  /**
   * Universal Search (local matches plus related canonical Quran verses)
   */
  async search(filter: SearchFilter): Promise<SearchMatch[]> {
    const results: SearchMatch[] = [];
    const query = filter.query.trim().toLowerCase();
    if (!query) return results;

    // 1. Search in Surahs
    if (filter.mode === 'all' || filter.mode === 'surah') {
      const matchedSurahs = SURAH_LIST.filter((s) => {
        const matchesQuery =
          s.namaLatin.toLowerCase().includes(query) ||
          s.arti.toLowerCase().includes(query) ||
          s.deskripsi.toLowerCase().includes(query) ||
          String(s.nomor) === query;
        const matchesRev = !filter.revelation || filter.revelation === 'all' || s.tempatTurun === filter.revelation;
        return matchesQuery && matchesRev;
      });

      for (const s of matchedSurahs.slice(0, 10)) {
        results.push({
          type: 'surah',
          surahNomor: s.nomor,
          surahNamaLatin: s.namaLatin,
          surahNamaArab: s.nama,
          snippet: `${s.arti} • ${s.jumlahAyat} Ayat • Turun di ${s.tempatTurun}`,
          highlightText: s.namaLatin
        });
      }
    }

    // 2. Search in Asbabun Nuzul
    if (filter.mode === 'all' || filter.mode === 'asbabun_nuzul') {
      const matchedAsbab = this.getAsbabunNuzulList(query);
      for (const item of matchedAsbab) {
        results.push({
          type: 'asbabun_nuzul',
          surahNomor: item.surahNomor,
          surahNamaLatin: item.surahNama,
          surahNamaArab: '',
          ayatNomor: item.ayatNomor,
          asbabunNuzul: item,
          snippet: item.tema + ': ' + item.kisah.slice(0, 120) + '...',
          highlightText: item.tema
        });
      }
    }

    // 3. Search existing verse index and semantic matches together.
    if (filter.mode === 'all' || filter.mode === 'terjemahan') {
    const requestId = ++semanticSearchRequest;
      semanticSearchController?.abort();
      const controller = new AbortController();
      semanticSearchController = controller;

      const existingTask = (async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&surah=${filter.surahNumber || ''}`);
          if (res.ok) {
            const apiMatches = await res.json();
            if (Array.isArray(apiMatches.results)) {
              for (const match of apiMatches.results) {
                if (match && typeof match === 'object') results.push({ ...match, searchSource: 'existing' });
              }
            }
          }
        } catch { /* Keep the local and semantic results available. */ }
      })();

      const semanticTask = (async () => {
        // Debounce semantic requests separately so live typing does not fan out upstream calls.
        await new Promise((resolve) => setTimeout(resolve, 450));
        if (controller.signal.aborted || requestId !== semanticSearchRequest) return;
        try {
          const response = await fetch('/api/search/semantic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: filter.query.trim(), type: 'quran', limit: 10 }),
            signal: controller.signal
          });
          if (!response.ok || controller.signal.aborted) return;
          const payload = await response.json();
          const references = Array.isArray(payload.results) ? payload.results : [];
          const unique = new Map<string, { surahNomor: number; ayatNomor: number }>();
          for (const ref of references) {
            const surahNomor = Number(ref?.surahNomor);
            const ayatNomor = Number(ref?.ayatNomor);
            if (Number.isInteger(surahNomor) && Number.isInteger(ayatNomor) && surahNomor >= 1 && surahNomor <= 114 && ayatNomor > 0) {
              unique.set(`${surahNomor}:${ayatNomor}`, { surahNomor, ayatNomor });
            }
          }
          const canonical = await Promise.all([...unique.values()].map(async (ref) => {
            try {
              const surah = await this.getSurahDetail(ref.surahNomor);
              const ayah = surah.ayat.find((item) => item.nomorAyat === ref.ayatNomor);
              if (!ayah) return null;
              return {
                type: 'ayah' as const,
                surahNomor: surah.nomor,
                surahNamaLatin: surah.namaLatin,
                surahNamaArab: surah.nama,
                ayatNomor: ayah.nomorAyat,
                teksArab: ayah.teksArab,
                teksLatin: ayah.teksLatin,
                teksIndonesia: ayah.teksIndonesia,
                snippet: ayah.teksIndonesia,
                highlightText: ayah.teksIndonesia,
                searchSource: 'semantic' as const
              } satisfies SearchMatch;
            } catch { return null; }
          }));
          if (controller.signal.aborted || requestId !== semanticSearchRequest) return;
          const seen = new Set(results
            .filter((match) => match.type === 'ayah' && match.ayatNomor)
            .map((match) => `${match.surahNomor}:${match.ayatNomor}`));
          for (const match of canonical) {
            if (!match) continue;
            const key = `${match.surahNomor}:${match.ayatNomor}`;
            if (!seen.has(key)) {
              seen.add(key);
              results.push(match);
            }
          }
        } catch { /* Semantic search is optional; the rest of search still succeeds. */ }
      })();

      await Promise.all([existingTask, semanticTask]);
    }

    return results;
  },

  /**
   * Bookmarks management via localStorage
   */
  getBookmarks(): BookmarkItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('quran_search_bookmarks');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(item: Omit<BookmarkItem, 'id' | 'createdAt'>): boolean {
    if (typeof window === 'undefined') return false;
    const current = this.getBookmarks();
    const existingIndex = current.findIndex(
      (b) => b.surahNomor === item.surahNomor && b.ayatNomor === item.ayatNomor
    );

    if (existingIndex >= 0) {
      current.splice(existingIndex, 1);
      localStorage.setItem('quran_search_bookmarks', JSON.stringify(current));
      return false; // Removed
    } else {
      const newBookmark: BookmarkItem = {
        ...item,
        id: `${item.surahNomor}:${item.ayatNomor}`,
        createdAt: Date.now()
      };
      current.unshift(newBookmark);
      localStorage.setItem('quran_search_bookmarks', JSON.stringify(current));
      return true; // Added
    }
  },

  isBookmarked(surahNomor: number, ayatNomor: number): boolean {
    if (typeof window === 'undefined') return false;
    const list = this.getBookmarks();
    return list.some((b) => b.surahNomor === surahNomor && b.ayatNomor === ayatNomor);
  }
};
