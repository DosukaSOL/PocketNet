# PocketNet

<div align="center">
  <img src="src/assets/images/pocketnet-logo.png" alt="PocketNet logo" width="220">

  <h3>A handheld-native social layer for Android gaming handhelds.</h3>

  <p>
    PocketNet is for players who live inside launchers, setup cards, screenshots, communities,
    and the tiny rituals that make a handheld feel like home.
  </p>

  <p>
    <img src="https://img.shields.io/badge/platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android">
    <img src="https://img.shields.io/badge/build-Expo%20SDK%2055-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 55">
    <img src="https://img.shields.io/badge/backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/release-APK%20first-4D7CFF?style=for-the-badge" alt="APK first">
    <img src="https://img.shields.io/badge/status-v1.3%20stable-7C3AED?style=for-the-badge" alt="v1.3 stable">
  </p>

  <p>
    <a href="#what-pocketnet-is">What it is</a> -
    <a href="#device-adaptive-design">Device-adaptive design</a> -
    <a href="#features">Features</a> -
    <a href="#run-it">Run it</a> -
    <a href="#ship-an-apk">Ship an APK</a> -
    <a href="#security">Security</a>
  </p>
</div>

---

## What PocketNet Is

PocketNet is a social app built specifically for Android handheld gaming users. It is not trying to be a generic social network with a game skin. The product is shaped around the way handheld players actually use their devices:

- sharing screenshots and setup notes;
- finding people with similar handhelds, frontends, systems, and games;
- joining small communities around devices, launchers, and play styles;
- keeping a manual currently-playing status;
- making a public profile that feels like a console profile plus a setup card.

PocketNet is designed for handhelds like AYN Thor, AYN Odin, Retroid devices, AYANEO Android handhelds, and similar Android gaming devices. It is also built with frontend culture in mind: Cocoon, Daijisho, ES-DE, Beacon, and other launcher setups are first-class profile identity, not an afterthought.

PocketNet is standalone and is not affiliated with AYN, Cocoon, Daijisho, ES-DE, Beacon, Supabase, Expo, or any other mentioned company/project.

## Beta Status — What Works & What Doesn't

PocketNet **v1.3.5** is the latest stable release. This is an honest snapshot for anyone downloading the APK.

### What's new in v1.3.5

- **GIF search works again.** Giphy's public Beta API key now returns `403 BANNED` for everyone, which broke in-app GIF search. The keyless fallback now uses **Tenor v1** with the documented anonymous web key — search returns real GIFs without any setup.
- **Real platform icons on profile social links.** GitHub, YouTube, Twitch, X (inline SVG), Discord (inline SVG), and a globe for personal websites. Two display modes per field:
  - **Link mode** — value starts with `http(s)://`: just the icon, clickable, opens the full URL.
  - **Handle mode** — anything else: icon + `@handle` next to it. For platforms with a known URL shape (X, Twitch, YouTube, GitHub) the icon is still clickable and resolves to the canonical profile URL.
- **Photos in comments.** New camera button in every comment composer opens the system image picker, uploads to the `post-images` bucket, and inserts the URL. `CommentCard` now renders `jpg/jpeg/png/gif/webp` inline.
- **First-run tour reliably appears.** `markTourPending()` now also emits a `DeviceEventEmitter` event so an already-mounted `AppTour` flips into the prompt phase right after sign-up, instead of waiting for the next remount.
- **Self online bubble stays green.** The presence heartbeat now optimistically refreshes the local `profile.lastSeenAt` so your own avatar is green immediately. `ProfileHeader` also treats `isCurrentUser` as always-online, and the status composer hardcodes online for the self avatar.
- **Bigger home logo.** The home hero logo is now twice its old size and dropped the square shell around it — just the mark.

### What's new in v1.3.4

- **Bigger profile banner + repositioned identity.** The banner is taller (240 px) and your display name, @handle, and level chip are now in a clean two-row block below the banner instead of overlapping it.
- **Border motion options.** Animated borders no longer always rotate — pick **Rotate, Pulse, Breathe, Shimmer, or Static** per preset. Motion is encoded in the existing `card_border` column as `preset::motion` so no schema change is needed. The live preview updates as you change motion.
- **More static border presets.** New non-animated borders: **Mono, Ocean, Rose, Forest, Slate, Neon (glow), Flames** — for users who want a strong look without animation.
- **JPEG / GIF profile card export.** A new format toggle on the export screen. **GIF** captures 8 frames at half resolution and encodes a real animated GIF on-device with pure JS (`gifenc` + `upng-js`); **JPEG** keeps full resolution for crisp stills.
- **Keyless in-app GIF search.** The GIF picker no longer requires you to bring your own Tenor key — it falls back to Giphy's documented public Beta key. Tenor is still preferred when `EXPO_PUBLIC_TENOR_KEY` is set.
- **Comments show profile pictures.** Every comment now renders a 28 px avatar of its author plus their @username, and tapping either opens the author's profile.
- **Live online presence.** Avatar status dots are now driven by the existing `last_seen_at` heartbeat. Green when active in the last 2 minutes, grey otherwise.
- **First-run tour.** After onboarding, an opt-in modal with Pocket Foxy walks new users through home, discover, and profile customization in ~30 seconds. State is stored in `AsyncStorage` (`pocketnet:tour-pending` / `pocketnet:tour-done`).
- **Technologist developer badge.** The `dev` badge emoji is now 🧑‍💻 instead of 🐺.

### What's new in v1.3.3

- **Live profile preview.** Edit Profile renders a real-time `ProfileHeader` at the top that updates as you type — display name, bio, avatar, banner, and border preview update without saving.
- **Static and Animated border sections.** Borders are split into two pickers. New animated borders: **lightning** (cyan strobe), **fire** (warm pulse), **glitch** (jittery RGB).
- **Upload your own GIF border.** New `border-images` storage bucket with creator-folder RLS. Recommended size shown in the UI: **600 × 600 GIF, under 4 MB**. The GIF rotates around your full card.
- **Delete your own comments.** Owner-only trash icon with confirm. Backed by a SECURITY DEFINER `delete_comment` RPC that only the comment author can call.
- **Community studio.** Communities now have an avatar, bio, social links, animated borders, and per-community notifications. The community page wraps the hero in `AnimatedCardBorder` and renders the avatar, bio, and a row of social link buttons.
- **Edit Community screen (owner only).** `/community/edit/<id>` lets the creator change name, description, bio, avatar (1:1 crop), banner (3:1 crop), GIF banner/avatar, animated border, GIF border upload, and six social fields. Saves via the `update_community` RPC.
- **Per-community notifications.** Bell button toggles `community_memberships.notify_on_post`. A SECURITY DEFINER trigger fans out `community_post` notifications to every member with the toggle on (blocked + banned pairs are skipped).
- **Owner + Moderator pin/unpin.** `pin_community_post(p_community_id, null)` unpins. The pinned section gets an Unpin button for moderators and the creator.
- **Tenor GIF picker.** Reply composer and post composer get a GIF button that opens a Tenor search modal (3-column grid). Without a key it falls back to a paste-a-URL field validated by regex. Replies render embedded GIFs inline.
- **Pull-to-refresh everywhere.** Home, Discover, Profile, Notifications, Community, User, Settings, Friends, Create, Messages — drag down to refresh.
- **Crop on upload.** `pickImage` takes an `aspect` parameter. Avatars crop to 1:1, banners crop to 3:1. GIF uploads skip cropping so animation is preserved.
- **GIF mime fix.** All six image buckets now accept any MIME; the previous “mime type image/gif is not supported” error is gone.

#### Optional environment variable

- `EXPO_PUBLIC_TENOR_KEY` — when set, enables in-app Tenor search in the GIF picker. Without it the GIF picker gracefully falls back to a paste-a-URL field. The key is **public** by design (Tenor v2 search) and is never committed; it is read at runtime from the build's environment.

### What's new in v1.3.2

- **Comment reply threads.** Tap Reply on any comment to start a thread. The original commenter is highlighted on the reply, and you get a notification when someone replies to your comment.
- **@mention tagging.** Type `@username` anywhere in a post or comment and that user gets a real notification (block-aware on the server). The trigger uses a SECURITY DEFINER function with `set search_path = public` and is granted only to `authenticated`.
- **Notifications inbox.** New bell icon on Home with an unread count and a dedicated Notifications screen. The `notifications` table is RLS-locked to the owner (SELECT/UPDATE/DELETE only — no INSERT policy, so notifications can only be created by server triggers). Opening the screen marks everything read.
- **Friend + Follow coexist.** You can now be friends AND follow someone, just friends, or just follow. The profile screen shows both buttons side by side.
- **"Other" picker textbox.** Picking Other for favourite handheld / frontend / system / game reveals a textbox to type your own. Stored in `custom_handhelds`, `custom_frontends`, `custom_systems`, `custom_games`.
- **XP and leveling.** Posting, commenting, getting reactions, following, and joining communities all earn XP via SECURITY DEFINER triggers calling `add_xp()` (revoked from all client roles). Level formula: `floor(sqrt(xp/50)) + 1`. You get a `level_up` notification on every climb, and a level chip renders next to your name.
- **Animated profile borders.** The entire profile card — banner, avatar, name, stats — can be wrapped in an animated border. Pick a preset (`classic`, `neon`, `sunset`, `aurora`, `gold`, `retro`, `plasma`) or paste a direct HTTPS image URL (animated GIF works). The `custom_border_url` column has a CHECK constraint that requires `https://`, image extension, and ≤ 512 chars — `data:` and `javascript:` URIs are rejected at the database layer.
- **Animated GIF avatars and banners.** New "Avatar GIF" / "Banner GIF" buttons in Edit Profile skip the cropper (which would flatten the animation) and only accept files with a `.gif` extension or `image/gif` MIME.
- **Achievements help popover.** A `?` icon next to the Achievements empty state opens a step-by-step guide to grabbing your RetroAchievements Web API key, with a bold warning that the key must never be shared.

### What's new in v1.3.1

- **RetroAchievements login fix.** v1.3.0 was returning HTTP 403 on real devices because RA's WAF rejects the default React Native okhttp User-Agent. v1.3.1 sends an explicit `PocketNet/1.3.1 (+https://github.com/DosukaSOL/PocketNet)` UA on every call to retroachievements.org. Verified with curl that bad credentials now return the expected JSON 401 instead of an HTML 403.
- **RA score syncs to your profile.** Your hardcore + softcore score is written to `profiles.ra_points` / `profiles.ra_softcore_points` on login and refreshes whenever you open the app (using the stored connect token — no password is re-sent). Profiles without a Web API key now show the cached score instead of "—".
- **Per-user notification preferences.** On any friend or follow's profile, pick exactly which pings you want from that person: posts, achievements, comments, or new friend connections. Stored owner-only in `notification_preferences` with RLS.
- **DEV badge.** A new permanently-glowing badge for the developer (`@dosuka`). The eligibility check lives inside `claim_dev_badge()` SECURITY DEFINER on the server — the badge cannot be granted to any other account, and the generic `award_badge()` path explicitly refuses the `dev` id.
- **OG + Collector backfill.** `award_badge('verified')` and `award_badge('collector')` were missing in v1.3.0 so onboarding silently no-op'd those calls. v1.3.1 adds both branches server-side.

### What's new in v1.3

- **OG badge — first 50 only.** Anyone who completes onboarding while fewer than 50 OGs exist is awarded the permanent OG badge. The 50-slot cap is enforced inside a SECURITY DEFINER Postgres function so the client cannot exceed it.
- **Earnable badges.** 13 badges total — Verified, Retro Linked, Wordsmith, Prolific, Centurion, Connector, Social Butterfly, Popular, Influencer, Community Builder, Pioneer, Collector — awarded server-side against real data (post counts, friend counts, profile completeness, etc.). Tap any badge on a profile to see what it means and how it was earned.
- **RetroAchievements login with username + password.** The settings card now defaults to a simple sign-in form. The password is sent to RA over HTTPS once and immediately discarded; only the username and session token are stored owner-only in `user_secrets`. The Web API key flow is still available as an "Advanced" option for the full achievement feed.
- **Push toggle on devices without FCM.** Standalone Android builds without Firebase credentials previously crashed when fetching an Expo push token. We now catch the failure, persist a synthetic local-device marker, and keep the toggle state correct so in-app and scheduled notifications still work.
- **Profile header cleanup.** Removed the redundant Pocket card section, the "Dual OLED" plate in banners, and the unverified-looking orange shield icon — replaced by your earned badges.

### What's new in v1.2

- **RetroAchievements integration** — link your RA account from Settings, see your achievements (badge art, points, recent unlocks) right on your profile. RA Web API keys live in a new `user_secrets` table with owner-only RLS.
- **Profile counts row** — Heart (followers), handshake (friends), message (replies), users (communities), trophy (achievements), and posts. Every chip is tappable and switches the tab below the header.
- **Replies section** — a new tab on every profile listing the user's comments on other people's posts (with the parent post for context).
- **"Places" → "Communities"** — naming cleaned up across the app.
- **Privacy lock** — Settings → Privacy lock. When on, only friends + followers can see your posts, replies, friends, followers, communities, and achievements. Enforced via the new `can_view_profile(uuid)` SECURITY DEFINER RPC.
- **Profile card exporter** — Settings → Export profile card. Pick a border (Classic, Aurora, Sunset, CRT, Holo, Midnight), toggle the full card (off by default), and save a PNG to your gallery. **Compact 1080 × 1620 px (inner 984 × 1524) · Full 1080 × 2400 px (inner 984 × 2304) · 48 px border.** Only the card is captured — surrounding UI is excluded.
- **Push notifications** — opt-in on first onboarding, toggle anytime in Settings. New `push_tokens` table with owner-only RLS. Server-side delivery wiring is staged but lands in a follow-up build.
- **Tap any avatar or name on a post** to jump to that profile (or your own Profile tab when it's you).
- **Bigger BrandMark** on the Home tab.
- **Updates section in Settings** — short and snappy patch notes, refreshed every build.
- **Sessions survive APK updates** — AsyncStorage-backed Supabase auth, no re-login when you update from v1.1.

> ⚠️ Push delivery is **opt-in storage of tokens only** in v1.2. Tokens are saved against your account but PocketNet does not yet send pushes from the backend — that lands in a follow-up build.

### What's new in v1.1

- **For You Page + Explore** — the Home tab now opens on a centered PocketNet wordmark with a segmented control. **For You Page** = you + friends + followed players + your communities. **Explore** = everyone else.
- **Follow system** — follow players without friending them. New `follows` table with RLS.
- **"Other" custom inputs** — every onboarding picker (handhelds, frontends, systems, games) has an Other chip that reveals a free-text field. Custom entries persist into dedicated `custom_*` columns.
- **Multi-handheld picker** — pick every device you actually use.
- **Branded "Posted" toast** — cyan→purple gradient pill that fades after 1.5s; no more Alert dialogs after posting.
- **GIF in the composer** — a GIF button next to Image; uploads keep the `image/gif` MIME so animation survives.
- **Profile stats** moved off Home onto the Profile tab.
- **Discover Add button** now flips through **Add → Requested → Friend** (and shows **Accept** when the other side requested you first).
- **Username uniqueness** error is now the friendly "Username already taken, try a different name" surfaced before signup ever talks to Supabase Auth.

### Working

- Account creation with email **or** username, plus password.
- Persistent login sessions across app restarts.
- **Multi-step onboarding wizard:** profile photo → banner → bio → handheld + frontend → favorite systems & games → social links → preview. Every step has Back, Skip, and Next.
- Profile create + edit: display name, username, avatar, banner, bio, region, social links.
- Handheld + frontend badges on profiles.
- Home feed with auto-refresh on focus.
- "Online now" carousel of recently active friends.
- Text and image posts with a hardened upload pipeline (8 MB cap, MIME inference).
- Likes, comments, delete own posts, report posts.
- Discover tab: search users, browse communities.
- Friend requests: send, accept, reject, friend list, block, report.
- **Friends screen** with online dots and incoming-request accept/decline.
- **Direct messages** with Row-Level-Security that lets only the two participants of a thread read or write. Realtime delivery via Supabase Postgres Changes. Unread badges on the Messages tab.
- **Presence heartbeat** — `last_seen_at` updated on every foreground/heartbeat tick so friends and DM threads can show "online" / "last seen Nm ago".
- Communities: create, join, leave, post, pin, moderator controls, bans, reports.
- In-app notifications screen with mark-all-read.
- Theme system: PocketNet (default), Dark, Light — applies on next app launch.
- Layout preferences: Standard, Split (input bottom), Split (input top), Compact.
- Settings screen: theme, layout, sign out.
- Row Level Security on **every** Supabase table, including DMs.
- No service-role key or private secret in the client.

### Known limitations / not working yet

- Built-in Supabase mailer is rate-limited (~2 emails/hour, ~30/day). Fine for a small beta; custom SMTP comes later.
- Theme + layout changes take full effect **on the next app launch** (React Native `StyleSheet` snapshots values at module load).
- Push notifications are not implemented. In-app notifications only.
- No self-serve account deletion — needs a support flow.
- No production moderation/admin console yet — reports are stored but not actioned through a UI.
- Image compression beyond an 8 MB hard cap is not enforced.
- AYN Thor dual-screen is OS-managed. PocketNet only reorders content **inside** the surface Android assigns it; users move the app between screens via Android, not via PocketNet.
- No real-time subscriptions — feeds refresh on focus, not via websockets.
- No voice, video, calling, or DMs in v1.

## Device-Adaptive Design

PocketNet asks users which Android handheld they use during onboarding, then tunes the app around that device profile.

Current beta device profiles include AYN Thor, AYN Odin 2/3, AYN Odin 2 Portal, Retroid Pocket devices, AYANEO Pocket devices, ANBERNIC RG556, Logitech G Cloud, Razer Edge, Steam Deck, Android phone/tablet, and a custom handheld profile.

Device profiles guide:

- layout density for compact, wide, large, and dual-screen handhelds;
- device badges and profile identity;
- dashboard copy and quick-action placement;
- future Android window-metrics and second-display work;
- QA expectations for each hardware class.

PocketNet does not fake private or undocumented hardware integrations. The current app works through normal Android/Expo capabilities and leaves a safe path for deeper native device adaptation later.

## Features

| Area | Beta foundation |
| --- | --- |
| Auth | Sign up, login, logout, password reset, persistent Supabase sessions |
| Profiles | Username, display name, avatar, banner, bio, region, social links, handheld/frontend badges |
| Handheld identity | Onboarding device picker, frontend, systems, games, currently playing, PocketCard-style setup notes |
| Feed | Text posts, image post flow, home feed, profile posts, community posts |
| Interactions | Likes, comments, delete own posts, report posts |
| Friends | User search, friend requests, accept/reject, friend list, block, report |
| Communities | Create, discover, join, leave, post, pin, creator/moderator controls, bans, reports |
| Notifications | In-app notification model for friend and interaction events |
| Safety | Blocks, reports, RLS policies, secret scanning, no service-role key in client |
| Release | APK-first EAS build profiles, sideload docs, signing guidance |

## Product Shape

PocketNet has four main tabs:

- **Home**: feed, notifications, friend requests.
- **Discover**: users, communities, community creation.
- **Post**: text/image composer.
- **Profile**: PocketCard, friends, profile posts, settings.

Supporting screens include login, signup, onboarding, password reset, profile editing, public user profiles, community detail, and settings.

## Tech Stack

- React Native
- Expo SDK 55
- Expo Router
- TypeScript
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Row Level Security
- AsyncStorage session persistence
- Jest
- ESLint
- Prettier

## Run It

Install dependencies:

```sh
npm install
```

Create local env:

```sh
cp .env.example .env
```

Fill only public mobile-safe values:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key
```

Do not put service-role keys, database passwords, signing credentials, or private tokens in `.env`.

Start Expo:

```sh
npm run start
```

Android:

```sh
npm run android
```

Web preview:

```sh
npm run web
```

If Supabase env values are missing, PocketNet opens in local preview mode with seeded data so the UI can still be reviewed.

## Supabase Setup

Backend status: the live Supabase project has been provisioned with PocketNet migrations and Storage buckets. Local `.env` contains only public mobile-safe Supabase values and is ignored by git.

1. Create a Supabase project.
2. Apply migrations from `supabase/migrations`.
3. Confirm Storage buckets exist:
   - `avatars`
   - `banners`
   - `post-images`
   - `community-banners`
4. Confirm Row Level Security is enabled.
5. Add the public Supabase URL and publishable key to `.env`.

With Supabase CLI:

```sh
supabase db push
```

The mobile client must use only public-safe Supabase keys. Service-role keys belong on trusted backend infrastructure only.

Launch notes: [`docs/BACKEND_LAUNCH.md`](docs/BACKEND_LAUNCH.md)

## Quality Checks

```sh
npm run typecheck
npm run lint
npm run test
npm run check:secrets
```

All together:

```sh
npm run qa
```

GitHub Actions:

- `PocketNet QA` runs typecheck, lint, tests, and secret scan.
- `Build Android APK` is ready for EAS/GitHub Releases once `EXPO_TOKEN` and Android signing credentials are configured.

Expo dependency compatibility:

```sh
HOME=$PWD/.expo-home npm_config_cache=.npm-cache npx expo install --check
```

## Ship an APK

PocketNet is APK-first. It is not planned for Google Play or the Apple App Store in v1.

Preview APK:

```sh
eas build --platform android --profile preview
```

Production APK:

```sh
eas build --platform android --profile production
```

Release rules:

- Keep package id `com.pocketnet.app`.
- Increment `android.versionCode` for every public APK.
- Keep signing keys out of git.
- Use the same signing certificate for updates.
- Publish APKs through GitHub Releases and the PocketNet website.
- Include a SHA-256 checksum with every release.
- GitHub release automation is in `.github/workflows/release-apk.yml`; it requires repository secret `EXPO_TOKEN`.

Full release guide: [`docs/APK_RELEASE.md`](docs/APK_RELEASE.md)

## Repository Map

```text
src/
  app/          Expo Router screens
  components/   Reusable UI and social cards
  features/     Auth and social data providers
  hooks/        Shared hooks
  lib/          Supabase, media, theme, mappers, helpers
  types/        Domain types
  assets/       PocketNet assets
supabase/
  migrations/   Schema, storage buckets, RLS policies
docs/           Research, architecture, release, QA
scripts/        Secret scanning and release helpers
tests/          Focused automated tests
```

## Docs

- [`docs/RESEARCH.md`](docs/RESEARCH.md): handheld, Thor, frontend, APK, Supabase, and UX research.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): app structure, data model, security model, device-adaptive direction.
- [`docs/DESIGN.md`](docs/DESIGN.md): PocketNet visual system, tokens, components, motion, and device-adaptive rules.
- [`docs/UI_REDESIGN_RESEARCH.md`](docs/UI_REDESIGN_RESEARCH.md): visual research and no-vibe-code guardrails.
- [`docs/UI_AUDIT.md`](docs/UI_AUDIT.md): screen-by-screen frontend quality audit.
- [`docs/UI_QA_CHECKLIST.md`](docs/UI_QA_CHECKLIST.md): redesign-specific UI QA checklist.
- [`docs/BACKEND_LAUNCH.md`](docs/BACKEND_LAUNCH.md): live Supabase status and backend/server launch notes.
- [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md): manual and automated beta checklist.
- [`docs/APK_RELEASE.md`](docs/APK_RELEASE.md): signing, EAS, sideloading, release checklist.
- [`SECURITY.md`](SECURITY.md): secrets, RLS, signing, dependency risk notes.
- [`PRIVACY.md`](PRIVACY.md): user data and v1 privacy posture.
- [`CHANGELOG.md`](CHANGELOG.md): release notes.

## Security

PocketNet is built for public-safe collaboration:

- `.gitignore` excludes env files, signing material, build output, local Supabase state, caches, and temporary files.
- `.env.example` contains placeholders only.
- The app expects only public Supabase URL and publishable key values.
- Supabase service-role keys must never be used in the mobile app.
- RLS policies are included in the migration.
- Secret scanning is available with `npm run check:secrets`.
- Staged files should be inspected before every push and release.

Current audit note: `npm audit --omit=dev` reports moderate findings through Expo SDK 55 toolchain dependencies. The suggested automatic fix downgrades Expo across major SDK lines, so the risk is documented in [`SECURITY.md`](SECURITY.md) and should be revisited with Expo SDK updates.

## Known Limitations

- Device adaptation does not use private or undocumented hardware APIs.
- Current game status is manual in v1.
- Push notifications are not implemented yet.
- Account deletion needs a production support/admin process.
- Production moderation needs an admin console or trusted backend workflow.
- Image compression and resizing should be hardened before wide release.

## Roadmap

Near-term shipping work:

- Connect production Supabase.
- Validate RLS with real users.
- Build and sign a real APK.
- Run device QA on Android handhelds.
- Add GitHub Actions for typecheck, lint, tests, and secret scan.
- Add moderation operations for reports.

Later:

- Push notifications.
- Self-serve account deletion.
- Shareable PocketCard export.
- Native Android shortcuts.
- Optional Thor device detection.
- Deeper frontend integrations.
- Full moderation/admin console.

---

<div align="center">
  <strong>PocketNet is for handheld people.</strong>
  <br>
  Small screens, big libraries, good setups, better friends.
</div>
