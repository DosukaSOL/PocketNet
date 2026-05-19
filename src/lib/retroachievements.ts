/**
 * RetroAchievements thin wrapper.
 *
 * Uses the public RA Web API:  https://retroachievements.org/API/
 *
 * Any user's web API key (claimed at https://retroachievements.org/controlpanel.php)
 * can query *any other* user's public data — that's how cocoon and most
 * community frontends do it.
 *
 * We never log the API key and never embed it in shared URLs.
 */

const BASE = 'https://retroachievements.org/API';

type RaCreds = { username: string; apiKey: string };

export type RaProfile = {
  user: string;
  totalPoints: number;
  totalTruePoints: number;
  rank: number | null;
  motto?: string;
  memberSince?: string;
  userPic?: string;
};

export type RaAchievement = {
  achievementId: string;
  title: string;
  description?: string;
  badgeUrl?: string;
  points: number;
  dateEarned?: string;
  gameTitle?: string;
  gameIcon?: string;
};

function authQuery(creds: RaCreds, extra: Record<string, string | number>) {
  const params = new URLSearchParams({ z: creds.username, y: creds.apiKey });
  for (const [k, v] of Object.entries(extra)) {
    params.set(k, String(v));
  }
  return params.toString();
}

async function call<T>(path: string, creds: RaCreds, extra: Record<string, string | number>): Promise<T> {
  const url = `${BASE}/${path}?${authQuery(creds, extra)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`RetroAchievements ${path} failed (${res.status})`);
  }
  const data = (await res.json()) as unknown;
  return data as T;
}

/** Validates a username + API key pair by hitting GetUserSummary. */
export async function verifyRaAccount(creds: RaCreds, targetUser?: string): Promise<RaProfile> {
  const user = targetUser ?? creds.username;
  const summary = await call<Record<string, unknown>>('API_GetUserSummary.php', creds, {
    u: user,
    g: 0,
    a: 0
  });
  if (!summary || typeof summary !== 'object') {
    throw new Error('RetroAchievements returned no data.');
  }
  return {
    user: String(summary.User ?? user),
    totalPoints: toNumber(summary.TotalPoints),
    totalTruePoints: toNumber(summary.TotalTruePoints),
    rank: summary.Rank == null ? null : toNumber(summary.Rank),
    motto: summary.Motto ? String(summary.Motto) : undefined,
    memberSince: summary.MemberSince ? String(summary.MemberSince) : undefined,
    userPic: summary.UserPic ? `https://media.retroachievements.org${String(summary.UserPic)}` : undefined
  };
}

/** Recent achievements (up to `count`) for any RA user. */
export async function fetchRecentAchievements(
  creds: RaCreds,
  targetUser: string,
  count = 50
): Promise<RaAchievement[]> {
  const rows = await call<Record<string, unknown>[]>(
    'API_GetUserRecentAchievements.php',
    creds,
    { u: targetUser, m: 60 * 24 * 365 * 5, c: count } // last 5y, capped count
  );
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    achievementId: String(row.AchievementID ?? ''),
    title: String(row.Title ?? ''),
    description: row.Description ? String(row.Description) : undefined,
    badgeUrl: row.BadgeName
      ? `https://media.retroachievements.org/Badge/${String(row.BadgeName)}.png`
      : undefined,
    points: toNumber(row.Points),
    dateEarned: row.Date ? String(row.Date) : undefined,
    gameTitle: row.GameTitle ? String(row.GameTitle) : undefined,
    gameIcon: row.GameIcon
      ? `https://media.retroachievements.org${String(row.GameIcon)}`
      : undefined
  }));
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
