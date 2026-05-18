# Changelog

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
