import { json } from '@sveltejs/kit';
import { SURAH_LIST } from '$lib/data/surahList';
import { ASBABUN_NUZUL_DATABASE } from '$lib/data/asbabunNuzulData';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const q = (url.searchParams.get('q') || '').trim();
  const surahParam = url.searchParams.get('surah');
  const targetSurah = surahParam ? Number(surahParam) : null;

  if (!q) {
    return json({ results: [] });
  }

  const queryLower = q.toLowerCase();
  const results: any[] = [];

  // 1. Search in Asbabun Nuzul
  for (const asbab of ASBABUN_NUZUL_DATABASE) {
    if (targetSurah && asbab.surahNomor !== targetSurah) continue;

    if (
      asbab.tema.toLowerCase().includes(queryLower) ||
      asbab.kisah.toLowerCase().includes(queryLower) ||
      asbab.riwayat.toLowerCase().includes(queryLower)
    ) {
      results.push({
        type: 'asbabun_nuzul',
        surahNomor: asbab.surahNomor,
        surahNamaLatin: asbab.surahNama,
        surahNamaArab: '',
        ayatNomor: asbab.ayatNomor,
        asbabunNuzul: asbab,
        snippet: asbab.tema + ': ' + asbab.kisah.slice(0, 160) + '...',
        highlightText: asbab.tema
      });
    }
  }

  // 2. Search in Surahs metadata
  for (const s of SURAH_LIST) {
    if (targetSurah && s.nomor !== targetSurah) continue;

    if (
      s.namaLatin.toLowerCase().includes(queryLower) ||
      s.arti.toLowerCase().includes(queryLower) ||
      s.deskripsi.toLowerCase().includes(queryLower)
    ) {
      results.push({
        type: 'surah',
        surahNomor: s.nomor,
        surahNamaLatin: s.namaLatin,
        surahNamaArab: s.nama,
        snippet: `Surat ke-${s.nomor} • ${s.arti} • ${s.jumlahAyat} Ayat (${s.tempatTurun})`,
        highlightText: s.namaLatin
      });
    }
  }

  return json({
    query: q,
    resultsCount: results.length,
    results: results.slice(0, 30)
  });
};
