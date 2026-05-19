# Changelog

## 1.3.1 - RA login fix, score sync, notifications, DEV badge

A bug-fix-plus release. The big one: **RetroAchievements login was returning HTTP 403** on real devices because RA's WAF blocks the default React Native okhttp User-Agent. We now send an explicit `PocketNet/1.3.1` UA on every call to retroachievements.org. v1.3.1 also wires the RA score directly into the profile (so it stays up to date even without a Web API key), adds per-friend notification preferences, and introduces a single-account DEV badge with a pulsing glow.

### New features

- **RA score sync.** When you log in to RetroAchievements your hardcore + softcore score is written to your profile (`ra_points`, `ra_softcore_points`). When you re-open the app the score refreshes in the background via the connect-token `login2` flow — no password needed.
- **Per-user notification preferences.** On any friend or follow's profile, pick exactly which pings you want: new posts, new achievements, new comments, or new friend connections. Stored owner-only in `notification_preferences` with RLS.
- **DEV badge.** A new permanently-glowing badge for the developer. It is cryptographically locked to a single username on the server (`claim_dev_badge()` rejects everyone else) and renders with a pulsing violet halo on the profile.
- **OG + Collector backfill.** Pre-existing accounts that should have those badges now do — `award_badge('verified')` and `award_badge('collector')` now exist server-side (they were missing in v1.3.0 so those calls silently no-op'd).

### Fixes

- **RetroAchievements login no longer returns 403.** Root cause: Cloudflare WAF rejecting the default RN okhttp User-Agent. Fix: every request to `retroachievements.org` now sends `User-Agent: PocketNet/1.3.1 (+https://github.com/DosukaSOL/PocketNet)`. Verified via curl that this UA returns the expected JSON 401 on bad creds (instead of an HTML 403).
- **Empty score on token-only login.** Profiles with an RA token but no Web API key now display the cached score from `profiles.ra_points` instead of "—".

### Security

- The `claim_dev_badge()` RPC is SECURITY DEFINER and selects the caller's username from `profiles` via `auth.uid()` — there is no way to grant the DEV badge by spoofing a username at the API layer.
- `award_badge('dev')` is explicitly rejected: the generic award path cannot grant the DEV badge under any circumstance.
- `notification_preferences` has RLS enabled with owner-only SELECT + FOR ALL policies (`user_id = auth.uid()`).
- The RA User-Agent header explicitly identifies the app + source URL — no spoofing of other clients.
- The RA password is still never persisted; only `ra_username` + `ra_token` go to `user_secrets`.

### Migrations

- `supabase/migrations/20260519130000_pocketnet_v131_dev_notifs_rapoints.sql`
  - Adds `ra_points`, `ra_softcore_points`, `ra_synced_at` columns to `profiles`.
  - Creates `notification_preferences` table + owner-only RLS policies.
  - Adds `claim_dev_badge()` SECURITY DEFINER (locked to a single username).
  - Re-creates `award_badge(text)` with `verified` and `collector` branches and an explicit `dev` deny.
  - Backfills the DEV + OG badges for the developer account.

## 1.3.0 - Badges, RA login, profile cleanup

v1.3 introduces a server-verified badge system anchored by a limited **OG badge** for the first 50 sign-ups, simplifies the RetroAchievements link flow to plain username + password, fixes the push toggle on devices without FCM, and cleans up the profile header.

### New features

- **OG badge — first 50 only.** Anyone who completes onboarding while fewer than 50 OGs exist is awarded the permanent OG badge. The counter is enforced inside a SECURITY DEFINER Postgres function, so the cap cannot be bypassed by the client.
- **Earnable badges.** 13 badges total, awarded server-side based on real data: Verified, Retro Linked, Wordsmith, Prolific, Centurion, Connector, Social Butterfly, Popular, Influencer, Community Builder, Pioneer, Collector. Tap any badge on a profile to see what it means and how it was earned.
- **RetroAchievements login with username + password.** The settings card now defaults to a simple sign-in form. PocketNet hands the password to RA over HTTPS once and immediately discards it — only the username and session token are stored owner-only in `user_secrets`. The Web API key flow is still available as an "Advanced" option for the full achievement feed.
- **Profile header cleanup.** Removed the redundant Pocket card section, the random "Dual OLED" plate that appeared in banners, and the unverified-looking orange shield icon.

### Fixes

- **Push toggle works on Android devices without FCM.** Builds shipped without Firebase credentials previously crashed when fetching an Expo push token. We now catch the failure, persist a synthetic local-device marker, and keep the toggle state correct so in-app and scheduled notifications still work. Remote pushes resume automatically once FCM is configured.

### Security

- Badges can only be granted through `public.claim_og_badge()` and `public.award_badge(text)` SECURITY DEFINER RPCs. Both verify eligibility against real data (post counts, friend counts, profile completeness, etc.) before mutating `profiles.badges`. Anonymous role is revoked from both functions.
- `user_secrets` now stores `ra_username` + `ra_token` in addition to the existing `ra_web_api_key`. RLS keeps the row owner-only. The RA password is never written to Supabase, AsyncStorage, or logs.
- Push token fallback uses a `local:<platform>:<timestamp>` marker — server-side fan-out can safely ignore non-Expo tokens.

### Migrations

- `supabase/migrations/20260519120000_pocketnet_v13_badges.sql` — adds `profiles.badges text[]`, extends `user_secrets` with `ra_token` and `ra_username`, and ships the `claim_og_badge` and `award_badge` SECURITY DEFINER RPCs.

## 1.2.0 - Profiles, achievements, push, exports

v1.2 turns the profile into the heart of the app. Profile headers now surface six tappable stats — posts, replies, friends, followers, communities, achievements — backed by RetroAchievements integration, a privacy lock for sensitive profiles, push notifications opt-in, and a pixel-perfect profile-card exporter.

### New features

- **RetroAchievements integration.** Link your RA account from Settings → RetroAchievements (username + Web API key, key stored owner-only via the new `user_secrets` table with RLS). Achievements appear on your profile with badge art, point totals, and recent unlock history pulled live from `API_GetUserSummary.php` / `API_GetUserRecentAchievements.php`.
- **Profile counts row.** Heart (followers), handshake (friends), message (replies), users (communities), trophy (achievements), and posts. Every chip is tappable and scrolls the matching section.
- **Replies section.** A new tab on every profile that lists the user's comments on other people's posts, with the parent post snippet for context.
- **"Places" → "Communities".** Naming is consistent across the profile, header chips, and copy.
- **Privacy lock.** Toggle in Settings → Privacy lock. Locked profiles only reveal posts, replies, friends, followers, communities, and achievements to confirmed friends and followers. Enforced server-side via the new `can_view_profile(uuid)` SECURITY DEFINER RPC.
- **Profile card exporter.** Settings → Export profile card. Pick a border (Classic, Aurora, Sunset, CRT, Holo, Midnight). Toggle the full card (off by default) to include posts, friends, followers, communities, and achievements. **Compact 1080 × 1620 px (inner 984 × 1524) / Full 1080 × 2400 px (inner 984 × 2304) / 48 px border** — exported as PNG straight to your gallery. Only the card is captured; surrounding UI is excluded.
- **Push notifications.** New `push_tokens` table with owner-only RLS, opt-in prompt on first onboarding, toggle in Settings → Push notifications. Server-side delivery wiring lands in a follow-up build.
- **Tap to open profile from a post.** Tapping the avatar or display name on any PostCard navigates to the author's profile (or your own profile when it's you).
- **Bigger Home BrandMark.** Wordmark/logo on the Home tab is now visibly larger.
- **Updates section in Settings.** In-app release notes — short and snappy, refreshed every build.
- **Sessions survive APK updates.** AsyncStorage-backed Supabase auth persists across reinstalls of the same app id, so v1.2 users keep their login when updating from v1.1.

### Fixes

- **Messages tab now scrolls.** Outer Screen wrapper takes scroll responsibility; FlatList is `scrollEnabled={false}` to avoid nested-scroll conflicts.

### Security

- New `user_secrets` table: owner-only RLS (`user_id = auth.uid()`) for select/insert/update/delete, revoked from `anon`. The RA Web API key is never logged or exposed in URLs at app boundaries — calls use the standard `z`/`y` query parameters and the value is read only from this table.
- New `push_tokens` table: owner-only RLS, unique on `(user_id, token)`, platform constrained to `'android' | 'ios' | 'web'`.
- New `profiles.is_private` column + `can_view_profile(uuid)` SECURITY DEFINER function returning a boolean (never the underlying rows).
- `npm run qa` (typecheck + lint + jest + secret scan) is clean.

### Versioning

- Bumped `version` → `1.2.0` and Android `versionCode` → `12`.
- Added `expo-notifications` and `expo-media-library` plugins.

## 1.1.0 - For You + Explore + Follows

v1.1 turns the Home tab into a real social surface. The command-bar card is gone, the wordmark is front and center, and the feed splits into two views: the people you actually care about (For You Page) and everyone else (Explore).

### New features

- **For You Page + Explore feeds.** The Home tab now opens on a centered PocketNet wordmark with a big BrandMark above it and a segmented control that flips between **For You Page** (you + friends + people you follow + your joined communities) and **Explore** (everyone else, no community-only posts). Pull-to-refresh works in both.
- **Follow system.** Follow players to see their posts on your For You Page without being friends. New `follows` table, RLS-locked to `auth.uid()` for writes, with optimistic `follow()` / `unfollow()` in the social provider.
- **"Other" custom inputs in onboarding.** Every catalog picker (handhelds, frontends, systems, games) now has an **Other** chip that reveals a free-text field. Custom entries persist into dedicated `custom_*` columns on `profiles` so we never lose the long tail of names the catalog doesn't ship.
- **Multi-handheld picker.** Players can pick every handheld they actually use; the first selection still acts as the "primary" for device-aware UI and we keep the full list in `favorite_handhelds text[]`.
- **Branded "Posted" toast.** Posting now fires a cyan→purple gradient toast that fades after 1.5s instead of a generic Alert dialog.
- **GIF in the composer.** A new GIF button in the Status Composer opens the gallery, validates the picked asset is actually a `.gif`, and uploads it with the correct `image/gif` MIME type so animation survives.
- **Profile stats moved.** Feed / Friends / Unread now live on the Profile tab where they belong; Home is just the feed.

### Fixes

- **Discover "Add" button now reflects state.** Tapping Add on a player flips to **Requested** immediately (optimistic), and to **Friend** once the request is accepted. **Accept** is shown when the other side requested you first.
- **Username uniqueness has a friendly error.** Signup now pre-checks the username via a SECURITY DEFINER RPC and surfaces "Username already taken, try a different name" before hitting Supabase Auth.

### Security

- `follows` is RLS-locked: anyone authenticated can read the graph, but inserts require `follower_id = auth.uid()` and a not-blocked check; deletes are scoped to the row owner.
- `is_username_available(text)` is a SECURITY DEFINER function granted only to `anon` and `authenticated`; it returns a boolean and never leaks any other profile data.
- New `custom_*` columns on `profiles` are `not null default '{}'::text[]` so they can't break existing reads.
- `npm run qa` (typecheck + lint + jest + secret scan) is clean.

### Versioning

- Bumped `version` → `1.1.0` and Android `versionCode` → `11`.

## 1.0.0 - First Stable Release

PocketNet 1.0 is the first build that's been through end-to-end UX, security, and release-engineering hardening. Everything below was added or fixed specifically for v1.0.

### New features

- **Direct messages.** New `dm_threads` + `dm_messages` tables with Row Level Security that allows only the two participants of a thread to read or write. A SECURITY DEFINER RPC `find_or_create_dm_thread(other_user_id uuid)` is the only insertion path, which enforces canonical participant ordering and a unique pair constraint. A new Messages tab shows your conversations with unread badges; tapping a thread opens a full chat surface with realtime updates via Supabase Postgres Changes. A "Message" button on every user profile opens a DM, and so does the friends list.
- **Multi-step onboarding wizard.** The onboarding screen is now a seven-step flow (profile photo → banner → bio → handheld + frontend → favorite systems & games → social links → preview) with Back, Skip, and Next on every step and a final live preview before saving. Avatar and banner uploads use the same hardened image pipeline as Edit Profile.
- **Friends list with online status.** New `/friends` screen lists your friends, shows accept/decline buttons for incoming requests, and renders an "online" dot for anyone whose `last_seen_at` heartbeat was in the last two minutes. "Last seen" is rendered as relative time when offline.
- **Presence heartbeat.** New `profiles.last_seen_at` column and `touch_last_seen()` SECURITY DEFINER RPC. The client pings on bootstrap, every 60 seconds while in foreground, and whenever the app comes back to the foreground. Both the Messages tab and Friends screen consume it.
- **Banner upload in onboarding.** First-run users can now set a Twitter/Facebook-style banner during the onboarding wizard — same picker, same `banners` bucket as Edit Profile.

### Fixes

- **Orientation on dual-screen handhelds.** `app.config.ts` now declares `orientation: 'default'` and the runtime hook calls `ScreenOrientation.unlockAsync()` instead of forcing PORTRAIT_UP. On the AYN Thor's secondary screen the previous hard-lock made the activity launch sideways because the panel's natural orientation is rotated; letting the OS decide per-display gets it right side up on every screen we tested.

### Security

- New DM tables are RLS-locked. Direct `INSERT` into `dm_threads` is rejected at the policy layer — the only path is the SECURITY DEFINER helper, which itself blocks messaging if either user has blocked the other. `dm_messages` SELECT and INSERT are both bounded to thread participants; UPDATE is only allowed on read-receipts for messages you didn't send.
- All new functions revoke from `public` + `anon` and grant only to `authenticated`.
- The `npm run check:secrets` scan and the full QA pipeline (typecheck + lint + jest + secret scan) pass on every commit.

### Versioning

- Bumped `version` → `1.0.0` and Android `versionCode` → `10`.

## 0.1.4 - First-Install Flow & Orientation Fixes

- **Fix (auth gate):** APK builds now bake the public `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` into the binary via an `env` block in `eas.json`. Before this, the released APK had no Supabase config so `hasSupabaseConfig` evaluated `false`, which forced the app into preview mode on first launch and skipped the sign-up/login screen.
- **Fix (no more mock data in release):** `SocialProvider` now starts with empty feeds, communities, friends, friend requests, and notifications whenever a real Supabase session is in play. The mock seed (Mira, Ren, sample posts/communities/requests) only loads in explicit preview mode for local QA — never in a real install.
- **Fix (preview button leak):** removed the "Preview beta" button from the login screen when Supabase is configured. Released builds force real sign-up or sign-in.
- **Fix (orientation on dual-screen handhelds):** added `expo-screen-orientation` and a runtime `lockAsync(PORTRAIT_UP)` call in the root layout. The AndroidManifest `screenOrientation="portrait"` hint is preserved as a fallback. Together these stop the activity from launching sideways on the AYN Thor's secondary screen.
- Bumped `version` → `0.1.4` and Android `versionCode` → `4`.

## 0.1.3 - Beta Release Hardening

- **Fix (Android build):** pinned `react-native-worklets` to `0.7.4` so it stays compatible with `react-native-reanimated@4.2.1`. The transitive `0.8.3` was failing the EAS Gradle build with `[Reanimated] Your installed version of Worklets (0.8.3) is not compatible with installed version of Reanimated (4.2.1)`.
- Added a **Beta Status** section to the README spelling out what works today and what doesn't.
- **Email confirmation landing page:** added a branded "Email confirmed" page at `docs/index.html`, hosted free via GitHub Pages at `https://dosukasol.github.io/PocketNet/`. Supabase Site URL points there, so desktop browsers now see a real confirmation page instead of a broken deep-link, while Android still bounces into the app via the "Open PocketNet" button (which preserves any PKCE token in the URL hash).

## 0.1.2 - Themes, Layout Modes, Username Login

- Added theme system with **PocketNet**, **Dark**, and **Light** palettes, switchable from Settings. Selection persists and applies on next launch.
- Added layout preferences (Standard / Split · Input bottom / Split · Input top / Compact) for handheld and dual-screen ergonomics. Composer screen reorders based on the choice.
- Login now accepts **email OR username** + password. Adds a Supabase `email_for_username` SECURITY DEFINER RPC so anon clients can resolve a username to its login email.
- Centered the public-beta and other auth-hero badges under the logo with a new `Badge align="center"` prop.

## 0.1.1 - Ship Polish Pass

- Hardened image uploads to use `fetch().arrayBuffer()` instead of base64+`atob`, fixing fragility on Hermes/web and adding a hard 8 MB cap.
- Added a dedicated `/notifications` screen with mark-all-read, accessible from a Bell icon in the home command bar.
- Added an "Online now" horizontal friends carousel on the home feed for instant glanceability.
- Home and Discover now auto-refresh from Supabase on tab focus.

## 0.1.0 - Public Beta Foundation

- Built Expo Router Android app structure.
- Added Supabase Auth client setup with persistent sessions.
- Added preview mode for local QA without Supabase credentials.
- Added profiles, media upload hooks, feed, comments, likes, friends, communities, reports, blocks, notifications, and settings screens.
- Added device-adaptive onboarding and layout tuning for Android handheld profiles.
- Added Premium Neon Handheld Social frontend system with device profiles, polished social cards, motion primitives, redesigned onboarding/feed/profile/discovery/community/settings surfaces, and removal of the old separated device-specific tab.
- Added branded startup intro animation with PocketNet logo and a short local jingle.
- Provisioned live Supabase migrations and added backend hardening migrations.
- Added GitHub Actions for QA and EAS APK release automation.
- Added Supabase schema, storage buckets, and RLS policies.
- Added APK release documentation and secret scanning.
- Added focused tests for moderation rules and repository safety.
