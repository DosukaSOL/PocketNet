// In-app GIF search. Tries Tenor v2 first when EXPO_PUBLIC_TENOR_KEY is
// configured, otherwise falls back to Giphy's public Beta API key which is
// rate-limited but keyless — meaning users always get an in-app GIF picker
// instead of having to paste URLs.
//
// The Giphy beta key has been published in Giphy's own developer docs for
// years. It is intended for prototyping and small-scale use. We pass a
// strict rating ("pg-13") so we don't surface explicit content by default.

const TENOR_ENDPOINT = 'https://tenor.googleapis.com/v2/search';
const TENOR_TRENDING = 'https://tenor.googleapis.com/v2/featured';
const GIPHY_ENDPOINT = 'https://api.giphy.com/v1/gifs/search';
const GIPHY_TRENDING = 'https://api.giphy.com/v1/gifs/trending';
const GIPHY_PUBLIC_KEY = 'dc6zaTOxFJmzC';

export type TenorGif = {
  id: string;
  /** Direct image URL suitable for embedding. */
  url: string;
  /** Smaller preview for grid display. */
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

/** Always true now that there is a keyless Giphy fallback. */
export function isTenorEnabled(): boolean {
  return true;
}

type TenorMediaFormat = { url: string; dims?: [number, number] };
type TenorResponseItem = { id: string; media_formats?: Record<string, TenorMediaFormat> };
type TenorResponse = { results?: TenorResponseItem[] };

async function searchTenor(query: string, limit: number, key: string): Promise<TenorGif[]> {
  const isTrending = !query.trim();
  const base = isTrending ? TENOR_TRENDING : TENOR_ENDPOINT;
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

  const data = (await res.json()) as TenorResponse;
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

type GiphyImage = { url?: string; width?: string | number; height?: string | number };
type GiphyItem = {
  id: string;
  images?: {
    original?: GiphyImage;
    downsized_medium?: GiphyImage;
    fixed_width?: GiphyImage;
    fixed_width_small?: GiphyImage;
  };
};
type GiphyResponse = { data?: GiphyItem[] };

async function searchGiphy(query: string, limit: number): Promise<TenorGif[]> {
  const isTrending = !query.trim();
  const base = isTrending ? GIPHY_TRENDING : GIPHY_ENDPOINT;
  const params = new URLSearchParams({
    api_key: GIPHY_PUBLIC_KEY,
    limit: String(limit),
    rating: 'pg-13',
    bundle: 'messaging_non_clips'
  });
  if (!isTrending) params.set('q', query.trim());

  let res: Response;
  try {
    res = await fetch(`${base}?${params.toString()}`);
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const data = (await res.json()) as GiphyResponse;
  const items = data.data ?? [];
  return items
    .map((item) => {
      const original = item.images?.downsized_medium ?? item.images?.original;
      const tiny = item.images?.fixed_width_small ?? item.images?.fixed_width ?? original;
      if (!original?.url) return null;
      return {
        id: String(item.id),
        url: original.url,
        previewUrl: tiny?.url ?? original.url,
        width: Number(original.width ?? 320),
        height: Number(original.height ?? 240)
      } satisfies TenorGif;
    })
    .filter((g): g is TenorGif => g !== null);
}

export async function searchGifs(query: string, limit = 24): Promise<TenorGif[]> {
  const tenorKey = readTenorKey();
  if (tenorKey) {
    const tenor = await searchTenor(query, limit, tenorKey);
    if (tenor.length > 0) return tenor;
  }
  return searchGiphy(query, limit);
}
