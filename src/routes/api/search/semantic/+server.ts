import { json } from '@sveltejs/kit';
import { SURAH_LIST } from '$lib/data/surahList';
import type { RequestHandler } from './$types';

const MAX_QUERY_LENGTH = 200;
const MAX_RESULTS = 10;
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const rateBuckets = new Map<string, { startedAt: number; count: number }>();

interface QuranReference {
  surahNomor: number;
  ayatNomor: number;
  relevance?: number;
}

function unavailable(status = 200) {
  return json(
    { available: false, results: [] },
    { status, headers: { 'cache-control': 'no-store' } }
  );
}

function withinRateLimit(address: string, now: number): boolean {
  const current = rateBuckets.get(address);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(address, { startedAt: now, count: 1 });
    if (rateBuckets.size > 1_000) {
      for (const [key, bucket] of rateBuckets) {
        if (now - bucket.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(key);
      }
    }
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

function normalizeReference(value: unknown): QuranReference | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  let surahNumber = Number(item.surah_number);
  let ayahNumber = Number(item.ayah_number);

  if ((!Number.isInteger(surahNumber) || !Number.isInteger(ayahNumber)) && typeof item.ayah_key === 'string') {
    const match = item.ayah_key.match(/^(\d{1,3}):(\d{1,3})$/);
    if (match) {
      surahNumber = Number(match[1]);
      ayahNumber = Number(match[2]);
    }
  }

  const surah = SURAH_LIST[surahNumber - 1];
  if (!surah || !Number.isInteger(ayahNumber) || ayahNumber < 1 || ayahNumber > surah.jumlahAyat) return null;

  const relevance = typeof item.similarity === 'number' && Number.isFinite(item.similarity)
    ? item.similarity
    : undefined;
  return { surahNomor: surahNumber, ayatNomor: ayahNumber, relevance };
}

export const POST: RequestHandler = async (event) => {
  let address = 'unknown';
  try {
    address = event.getClientAddress();
  } catch {
    // Some local adapters do not expose an address; the shared fallback remains bounded.
  }
  if (!withinRateLimit(address, Date.now())) return unavailable(429);

  let body: unknown;
  try {
    body = await event.request.json();
  } catch {
    return json({ error: 'Permintaan tidak valid.' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const query = body && typeof body === 'object' ? (body as Record<string, unknown>).q : undefined;
  if (typeof query !== 'string' || query.length > MAX_QUERY_LENGTH) {
    return json({ error: 'Kata kunci tidak valid.' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }
  const q = query.trim();
  if (q.length < 2) {
    return json({ available: true, results: [] }, { headers: { 'cache-control': 'no-store' } });
  }

  const apiKey = process.env.AMANAH_SUNNAH_API_KEY;
  if (!apiKey) return unavailable();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_500);
  try {
    const response = await fetch('https://sunnah.amanahagent.cloud/api/v1/search', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ q, type: 'quran', limit: MAX_RESULTS }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.warn('Semantic Quran search unavailable', { status: response.status });
      return unavailable();
    }

    const payload: unknown = await response.json();
    const records = payload && typeof payload === 'object' && Array.isArray((payload as Record<string, unknown>).results)
      ? (payload as { results: unknown[] }).results
      : [];

    const normalized = records
      .map(normalizeReference)
      .filter((reference): reference is QuranReference => reference !== null)
      .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
      .slice(0, MAX_RESULTS)
      .map(({ surahNomor, ayatNomor }) => ({ surahNomor, ayatNomor }));

    return json({ available: true, results: normalized }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network';
    console.warn('Semantic Quran search unavailable', { reason });
    return unavailable();
  } finally {
    clearTimeout(timeout);
  }
};
