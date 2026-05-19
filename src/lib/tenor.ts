// Tenor v2 search. Set EXPO_PUBLIC_TENOR_KEY at build time (eas secret /
// .env). If unset, searchGifs returns []; callers should fall back to a
// "paste a GIF URL" flow.

const ENDPOINT = 'https://tenor.googleapis.com/v2/search';

export type TenorGif = {
  id: string;
  /** Direct .gif URL suitable for posting. */
  url: string;
  /** Smaller preview for grid display. */
  previewUrl: string;
  width: number;
  height: number;
};

type TenorMediaFormat = {
  url: string;
  dims?: [number, number];
};

type TenorResponseItem = {
  id: string;
  media_formats?: Record<string, TenorMediaFormat>;
};

type TenorResponse = {
  results?: TenorResponseItem[];
};

function readKey(): string | null {
  // expo's static replacer requires literal `process.env.EXPO_PUBLIC_*`.
  const raw = process.env.EXPO_PUBLIC_TENOR_KEY;
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isTenorEnabled(): boolean {
  return readKey() !== null;
}

export async function searchGifs(query: string, limit = 24): Promise<TenorGif[]> {
  const key = readKey();
  if (!key) return [];

  const q = query.trim() || 'gaming';
  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&key=${encodeURIComponent(key)}&limit=${limit}&media_filter=gif,tinygif&contentfilter=high`;
  let res: Response;
  try {
    res = await fetch(url);
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
    .filter((entry): entry is TenorGif => entry !== null);
}
