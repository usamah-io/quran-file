export interface SurahInfo {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: 'Mekah' | 'Madinah' | string;
  arti: string;
  deskripsi: string;
  audioFull?: Record<string, string>;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
  surahNumber?: number;
  surahLatin?: string;
  asbabunNuzul?: AsbabunNuzulItem;
  tafsirRingkas?: string;
}

export interface AsbabunNuzulItem {
  id?: string;
  surahNomor: number;
  surahNama: string;
  ayatNomor: string | number; // e.g. "1-5" or 186
  tema: string;
  riwayat: string;
  kisah: string;
  sumber: string; // e.g. "HR. Al-Bukhari & Muslim", "Lubabun Nuqul fi Asbabin Nuzul - Imam As-Suyuthi"
}

export interface SurahDetail extends SurahInfo {
  ayat: Ayah[];
  suratSelanjutnya?: SurahInfo | false;
  suratSebelumnya?: SurahInfo | false;
}

export interface SearchFilter {
  query: string;
  mode: 'all' | 'terjemahan' | 'surah' | 'asbabun_nuzul';
  surahNumber?: number;
  revelation?: 'all' | 'Mekah' | 'Madinah';
}

export interface SearchMatch {
  type: 'surah' | 'ayah' | 'asbabun_nuzul';
  surahNomor: number;
  surahNamaLatin: string;
  surahNamaArab: string;
  ayatNomor?: number | string;
  teksArab?: string;
  teksLatin?: string;
  teksIndonesia?: string;
  asbabunNuzul?: AsbabunNuzulItem;
  snippet: string;
  highlightText: string;
  searchSource?: 'existing' | 'semantic';
}

export interface BookmarkItem {
  id: string;
  surahNomor: number;
  surahNamaLatin: string;
  ayatNomor: number;
  teksArab: string;
  teksIndonesia: string;
  createdAt: number;
}
