# PocketNet Research Notes

Research completed: 2026-05-17

PocketNet is a standalone product and is not affiliated with AYN, Cocoon, Daijisho, ES-DE, Beacon, Supabase, Expo, or any other hardware/software project mentioned here.

## Handheld Audience

Android handheld users are not just "phone users with controllers." They spend time in launcher/front-end environments, maintain libraries across many emulators and native Android games, care about screenshots and setups, and often use landscape, clamshell, or docked contexts. PocketNet should therefore feel closer to a console social layer than a generic social feed:

- Keep common actions thumb-friendly: update status, post a screenshot, check friends, open communities.
- Make identity setup-focused: device, frontend, systems, favorite games, current play status.
- Avoid heavy creator-tool complexity in v1; handheld users need quick posting and discovery between play sessions.
- Design for dark OLED-first use with crisp contrast and low-glare surfaces.
- Support both touch and controller-style navigation patterns through clear focus states, large tap targets, and predictable tab structure.

## AYN Thor and ThorLink

AYN lists Thor as an Android 13 handheld with a Snapdragon 8 Gen 2 CPU, a 6-inch AMOLED touch screen, and a 6000 mAh battery on its official site ([AYN](https://www.ayntec.com/)). Retail listing imagery for Thor Max describes a clamshell dual-OLED device: a 6-inch 1080x1920 120 Hz top display and a 3.92-inch 1080x1240 60 Hz bottom display, plus AYN multitasking and Thor Control Center concepts ([Best Buy](https://www.bestbuy.com/product/thor-max-6-dualamoled-android-gaming-handheld-snapdragon-8-gen-2-16gb-ram-1tb-storage/J3R85PHQWG)).

Implications for ThorLink:

- Do not fake system-level dual-screen APIs. Expo/React Native cannot directly control AYN's display strategy without native/device-specific integration.
- Make ThorLink a first-class app section that is useful today: compact dashboard, quick status, quick screenshot post, friend activity, Thor setup card, and a second-screen-friendly visual mode.
- Keep the layout compact and glanceable so it can sit well on a smaller secondary display or Android split-screen.
- Document future native integration hooks: device detection, Android window metrics, intent shortcuts, launcher/deep-link handoff, and optional native module research.

## Frontends and Launcher Culture

Retro Game Corps describes frontend launchers as tools that collect many emulator apps into a console-like navigation experience, and specifically notes that dual-screen frontends are becoming relevant for AYN Thor and similar devices. It calls Cocoon a preferred launcher for dual-screen devices because it replicates a 3DS-like experience and is free ([Retro Game Corps](https://retrogamecorps.com/2025/10/27/dual-screen-android-handheld-guide/)).

Daijisho positions itself as an Android frontend that organizes and launches retro games through existing emulators rather than acting as an emulator itself. Its value is unified browsing, metadata, box art, and a polished console-like library ([Daijisho](https://daijisho.com/)).

ES-DE describes itself as a gaming frontend for Linux, macOS, Windows, and Android, with controller navigation, support for many systems, scraping, themes, and Android distribution through non-Play channels such as Patreon, Samsung Galaxy Store, and Huawei AppGallery ([ES-DE](https://es-de.org/)).

Beacon's Play Store listing describes it as an Android launcher for classic gaming with emulator curation, cover art, metadata, and direct launching ([Google Play](https://play.google.com/store/apps/details?id=com.radikal.gamelauncher)).

Implications:

- PocketNet should expose favorite frontend as a profile badge, not attempt to replace frontends.
- Discovery should include communities around devices, frontends, systems, and setups.
- "Currently playing" should be manual in v1. Automatic game detection would require permissions/native integrations and may be privacy-sensitive.

## APK Distribution and Signing

Android requires APKs to be digitally signed before installation or update. For APK distribution outside Play, the project must manually sign releases. Android update behavior depends on package name and signing certificate continuity; if a future APK is signed with a different certificate, users install it as a different app unless the package name changes ([Android Developers](https://developer.android.com/studio/publish/app-signing)).

Implications:

- Use a stable package id: `com.pocketnet.app`.
- Keep release keystores out of git.
- Document keystore generation, secure storage, and recovery impact.
- Increment `android.versionCode` for every public APK.
- Use GitHub Releases with checksums and release notes.

## Expo / React Native / Supabase

Supabase's React Native quickstart uses AsyncStorage for mobile auth persistence, `autoRefreshToken`, `persistSession`, `detectSessionInUrl: false`, and a process lock for stable auth refresh behavior ([Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native)).

Supabase states that publishable keys are safe for mobile/desktop/web apps because those environments are public; access protection must come from Auth plus Row Level Security. It also warns never to expose secret keys or service-role keys publicly ([Supabase API Keys](https://supabase.com/docs/guides/getting-started/api-keys)).

Supabase RLS documentation says RLS should be enabled on exposed-schema tables and that service keys bypass RLS and must not be exposed to customers ([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)).

Expo documents APK builds through EAS build profiles with Android `buildType: "apk"` ([Expo APK builds](https://docs.expo.dev/build-reference/apk/)).

Implications:

- Client uses only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- No service-role keys in the app, repo, logs, docs examples, or CI config.
- All public tables need RLS and explicit policies.
- Use Supabase Storage buckets with owner-scoped paths.
- Keep admin/moderation escalation in database policies/functions, not trusted client-only checks.

## Social Safety and Moderation

PocketNet v1 needs safety features from the beginning because user-generated content is core:

- Block users and exclude blocked relationships from feeds/search where practical.
- Report users, posts, comments, and communities.
- Community creator has full moderation rights; community moderators can help where policy allows.
- Normal users can post, like, comment, join, and leave, but cannot delete others' content or alter roles.
- Keep public profile data intentionally user-provided; avoid harvesting installed apps or game libraries.

## Product Direction for Beta

The beta should ship as:

- A polished OLED-first Expo Android app.
- Supabase-backed auth, profile, feed, friends, communities, notifications, reports, and storage-ready media paths.
- A local preview mode for UI/QA when Supabase env values are not configured.
- ThorLink as a real app section with a compact AYN Thor-oriented dashboard and documented future native integration path.
- APK release documentation and secret scanning before every commit/release.
