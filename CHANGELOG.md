# Changelog

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
