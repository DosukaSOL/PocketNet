const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export function isOnline(lastSeenAt: string | undefined | null): boolean {
  if (!lastSeenAt) return false;
  const ts = new Date(lastSeenAt).getTime();
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < ONLINE_WINDOW_MS;
}

export function presenceLabel(lastSeenAt: string | undefined | null): string {
  if (!lastSeenAt) return 'Offline';
  if (isOnline(lastSeenAt)) return 'Online';
  const ts = new Date(lastSeenAt).getTime();
  if (!Number.isFinite(ts)) return 'Offline';
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60_000));
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Last seen ${days}d ago`;
}
