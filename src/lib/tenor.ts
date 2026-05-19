// In-app GIF search powered by Tenor's legacy v1 endpoint at api.tenor.com,
// which still accepts the long-published anonymous key "LIVDSRZULELA". Tenor's
// newer v2 endpoint on tenor.googleapis.com requires a per-project key — the
// v1 host is the only fully keyless option that still works today (verified
// against api.tenor.com on 2026-05-19). We use it as the default so users
// never need to paste a URL.
//
// If a project sets EXPO_PUBLIC_TENOR_KEY we prefer Tenor v2 (more reliable,
// no rate ceiling), but every install ships with v1 working out of the box.

const TENOR_V2_SEARCH = 'https://tenor.googleapis.com/v2/search';
const TENOR_V2_FEATURED = 'https://tenor.googleapis.com/v2/featured';
const TENOR_V1_SEARCH = 'https://api.tenor.com/v1/search';
const TENOR_V1_TRENDING = 'https://api.tenor.com/v1/trending';
const TENOR_V1_ANON_KEY = 'LIVDSRZULELA';

export type TenorGif = {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
};

function readTenorKey(): string | null {
  const raw = process.env.EXPO_PUBLIC_TENOR_KEY;
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isTenorEnabled(): boolean {
  return true;
}

type TenorV2MediaFormat = { url: string; dims?: [number, number] };
type TenorV2Item = { id: string; media_formats?: Record<string, TenorV2MediaFormat> };
type TenorV2Response = { results?: TenorV2Item[] };

async function searchTenorV2(query: string, limit: number, key: string): Promise<TenorGif[]> {
  const isTrending = !query.trim();
  const base = isTrending ? TENOR_V2_FEATURED : TENOR_V2_SEARCH;
  const params = new URLSearchParams({
    key,
    limit: String(limit),
    media_filter: 'gif,tinygif',
    contentfilter: 'high'
  });
  if (!isTrending) params.set('q', query.trim());

  let res: Response;
  try {
    res = await fetch(`${base}?${params.toString()}`);
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const data = (await res.json()) as TenorV2Response;
  const items = data.results ?? [];
  return items
    .map((item) => {
      const gif = item.media_formats?.gif;
      const tiny = item.media_formats?.tinygif ?? gif;
      if (!gif?.url) return null;
      return {
        id: String(item.id),
        url: gif.url,
        previewUrl: (tiny?.url ?? gif.url) as string,
        width: gif.dims?.[0] ?? 320,
        height: gif.dims?.[1] ?? 240
      } satisfies TenorGif;
    })
    .filter((g): g is TenorGif => g !== null);
}

type TenorV1MediaEntry = { url?: string; dims?: [number, number] };
type TenorV1MediaItem = {
  gif?: TenorV1MediaEntry;
  mediumgif?: TenorV1MediaEntry;
  tinygif?: TenorV1MediaEntry;
  nanogif?: TenorV1MediaEntry;
};
type TenorV1Item = { id: string; media?: TenorV1MediaItem[] };
type TenorV1Response = { results?: TenorV1Item[] };

async function searchTenorV1(query: string, limit: number): Promise<TenorGif[]> {
  const isTrending = !query.trim();
  const base = isTrending ? TENOR_V1_TRENDING : TENOR_V1_SEARCH;
  const params = new URLSearchParams({
    key: TENOR_V1_ANON_KEY,
    limit: String(limit),
    media_filter: 'minimal',
    contentfilter: 'high'
  });
  if (!isTrending) params.set('q', query.trim());

  let res: Response;
  try {
    res = await fetch(`${base}?${params.toString()}`);
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const data = (await res.json()) as TenorV1Response;
  const items = data.results ?? [];
  return items
    .map((item) => {
      const media = item.media?.[0];
      const gif = media?.mediumgif ?? media?.gif;
      const tiny = media?.tinygif ?? media?.nanogif ?? gif;
      if (!gif?.url) return null;
      return {
        id: String(item.id),
        url: gif.url,
        previewUrl: tiny?.url ?? gif.url,
        width: gif.dims?.[0] ?? 320,
        height: gif.dims?.[1] ?? 240
      } satisfies TenorGif;
    })
    .filter((g): g is TenorGif => g !== null);
}

export async function searchGifs(query: string, limit = 24): Promise<TenorGif[]> {
  const tenorKey = readTenorKey();
  if (tenorKey) {
    const v2 = await searchTenorV2(query, limit, tenorKey);
    if (v2.length > 0) return v2;
  }
  return searchTenorV1(query, limit);
}
