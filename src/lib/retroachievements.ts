/**
 * RetroAchievements thin wrapper.
 *
 * Two entry points:
 *
 *   1. `loginRa(username, password)` — POSTs to the RA legacy connect endpoint
 *      `dorequest.php?r=login2` and returns the user's auth Token (RA never
 *      returns the user's Web API key over this endpoint). We hand the
 *      password to RA over HTTPS and immediately discard it; only the username
 *      + token are persisted in `user_secrets` (owner-only RLS).
 *
 *   2. `verifyRaAccount({ username, apiKey })` — the original Web API key
 *      flow, kept as an "advanced" option so power users who already have a
 *      key can use it without a password.
 *
 * Fetching profile + achievements requires either:
 *   - a Web API key (preferred — full data), or
 *   - the connect Token returned by `loginRa` (limited — score, rank, recent
 *     unlocks via `dorequest.php?r=unlocks`).
 *
 * We never log secrets and never embed them in shared URLs.
 */

const WEB_BASE = 'https://retroachievements.org/API';
const CONNECT_BASE = 'https://retroachievements.org/dorequest.php';

// RetroAchievements' Cloudflare WAF returns 403 to default React-Native
// `okhttp/*` User-Agents. Sending an explicit PocketNet UA matches what the
// rest of the community frontends do (RAIntegration, RetroArch, etc.) and
// keeps us identifiable.
const RA_USER_AGENT = 'PocketNet/1.3.1 (+https://github.com/DosukaSOL/PocketNet)';

export type RaCredsKey = { kind: 'apiKey'; username: string; apiKey: string };
export type RaCredsToken = { kind: 'token'; username: string; token: string };
export type RaCreds = RaCredsKey | RaCredsToken;

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

export type RaLoginResult = {
  username: string;
  token: string;
  score: number;
  softcoreScore: number;
};

function authQueryKey(creds: RaCredsKey, extra: Record<string, string | number>) {
  const params = new URLSearchParams({ z: creds.username, y: creds.apiKey });
  for (const [k, v] of Object.entries(extra)) {
    params.set(k, String(v));
  }
  return params.toString();
}

async function callWeb<T>(
  path: string,
  creds: RaCredsKey,
  extra: Record<string, string | number>
): Promise<T> {
  const url = `${WEB_BASE}/${path}?${authQueryKey(creds, extra)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': RA_USER_AGENT }
  });
  if (!res.ok) {
    throw new Error(`RetroAchievements ${path} failed (${res.status})`);
  }
  const data = (await res.json()) as unknown;
  return data as T;
}

async function callConnect<T>(
  request: string,
  body: Record<string, string>
): Promise<T> {
  const form = new URLSearchParams({ r: request, ...body });
  const res = await fetch(CONNECT_BASE, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': RA_USER_AGENT
    },
    body: form.toString()
  });
  // RA returns JSON for 200 *and* 401 (invalid creds). Try to parse first so
  // we can surface a friendly error; fall back to HTTP status otherwise.
  let json: Record<string, unknown> | null = null;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const reason =
      json && typeof json.Error === 'string'
        ? (json.Error as string)
        : `RetroAchievements ${request} failed (${res.status})`;
    throw new Error(reason);
  }
  if (!json) {
    throw new Error(`RetroAchievements ${request} returned no data.`);
  }
  if (json.Success === false) {
    const reason = typeof json.Error === 'string' ? json.Error : 'RetroAchievements rejected the request.';
    throw new Error(reason);
  }
  return json as T;
}

/**
 * Authenticates against RA with a username + password. Returns the connect
 * Token. The password is sent to RA over HTTPS once and is NOT persisted by
 * PocketNet under any circumstance.
 */
export async function loginRa(username: string, password: string): Promise<RaLoginResult> {
  const u = username.trim();
  if (!u) throw new Error('Enter your RetroAchievements username.');
  if (!password) throw new Error('Enter your RetroAchievements password.');
  const res = await callConnect<Record<string, unknown>>('login2', { u, p: password });
  if (!res.Token) {
    throw new Error('RetroAchievements did not return an auth token.');
  }
  return {
    username: String(res.User ?? u),
    token: String(res.Token),
    score: toNumber(res.Score),
    softcoreScore: toNumber(res.SoftcoreScore)
  };
}

/** Validates a username + API key pair by hitting GetUserSummary. */
export async function verifyRaAccount(creds: RaCredsKey, targetUser?: string): Promise<RaProfile> {
  const user = targetUser ?? creds.username;
  const summary = await callWeb<Record<string, unknown>>('API_GetUserSummary.php', creds, {
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

/** Recent achievements (up to `count`) for any RA user. Requires API key creds. */
export async function fetchRecentAchievements(
  creds: RaCredsKey,
  targetUser: string,
  count = 50
): Promise<RaAchievement[]> {
  const rows = await callWeb<Record<string, unknown>[]>(
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

/**
 * Connect-token "ping" used to validate that a stored token is still good.
 * RA's `ping` endpoint accepts `u` + `t` and returns Success.
 */
export async function pingRa(creds: RaCredsToken): Promise<boolean> {
  try {
    await callConnect('ping', { u: creds.username, t: creds.token });
    return true;
  } catch {
    return false;
  }
}

/**
 * Refresh the cached hardcore/softcore score for a token-linked user. RA's
 * `login2` request also accepts an existing Token in place of the password,
 * which is how RetroArch / RAIntegration keep the score up to date without
 * re-prompting. Returns `null` if the token has been revoked.
 */
export async function refreshRaScore(
  creds: RaCredsToken
): Promise<{ score: number; softcoreScore: number; token: string } | null> {
  try {
    const res = await callConnect<Record<string, unknown>>('login2', {
      u: creds.username,
      t: creds.token
    });
    return {
      score: toNumber(res.Score),
      softcoreScore: toNumber(res.SoftcoreScore),
      token: typeof res.Token === 'string' ? res.Token : creds.token
    };
  } catch {
    return null;
  }
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

