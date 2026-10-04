import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const cache = new Map<number, any>();

export const GET: RequestHandler = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id) || id < 1 || id > 114) {
    throw error(400, 'Nomor surat harus antara 1 dan 114');
  }

  if (cache.has(id)) {
    return json({
      code: 200,
      cached: true,
      data: cache.get(id)
    });
  }

  try {
    const res = await fetch(`https://equran.id/api/v2/surat/${id}`);
    if (!res.ok) {
      throw new Error(`External API responded with status ${res.status}`);
    }
    const data = await res.json();
    if (data.data) {
      cache.set(id, data.data);
      return json({
        code: 200,
        cached: false,
        data: data.data
      });
    }
    return json(data);
  } catch (err: any) {
    return json(
      {
        code: 500,
        message: 'Gagal memuat data surat dari server',
        error: err?.message || String(err)
      },
      { status: 500 }
    );
  }
};
