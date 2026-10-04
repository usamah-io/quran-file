import { json } from '@sveltejs/kit';
import { SURAH_LIST } from '$lib/data/surahList';

export async function GET() {
  return json({
    code: 200,
    message: 'Success retrieving surah list',
    data: SURAH_LIST
  });
}
