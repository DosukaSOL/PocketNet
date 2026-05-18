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
    <img src="https://img.shields.io/badge/status-public%20beta%20foundation-B6F35C?style=for-the-badge" alt="Public beta foundation">
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
