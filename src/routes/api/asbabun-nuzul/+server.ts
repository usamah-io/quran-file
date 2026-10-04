import { json } from '@sveltejs/kit';
import { ASBABUN_NUZUL_DATABASE } from '$lib/data/asbabunNuzulData';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const surah = url.searchParams.get('surah');

  let results = [...ASBABUN_NUZUL_DATABASE];

  if (surah) {
    const surahNum = Number(surah);
    if (!isNaN(surahNum)) {
      results = results.filter((item) => item.surahNomor === surahNum);
    }
  }

  if (q) {
    results = results.filter(
      (item) =>
        item.tema.toLowerCase().includes(q) ||
        item.kisah.toLowerCase().includes(q) ||
        item.riwayat.toLowerCase().includes(q) ||
        item.surahNama.toLowerCase().includes(q) ||
        item.sumber.toLowerCase().includes(q)
    );
  }

  return json({
    code: 200,
    total: results.length,
    data: results
  });
};
