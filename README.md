# PocketNet

PocketNet is a handheld-native social app for Android gaming handheld users. It focuses on setup identity, screenshots, friends, communities, and quick status updates for devices such as AYN Thor, AYN Odin, Retroid handhelds, AYANEO Android handhelds, and similar devices.

ThorLink is the AYN Thor-specific companion mode inside PocketNet. It provides a compact social dashboard, quick status flow, screenshot entry point, Thor device identity, and a dual-screen-friendly UX direction.

PocketNet is standalone and is not affiliated with AYN, Cocoon, Daijisho, ES-DE, Beacon, Supabase, Expo, or any other mentioned company/project.

## Features

- Supabase Auth sign up, login, logout, password reset, and persistent sessions.
- Profile editing with avatar, banner, bio, region, social links-ready schema, favorite handheld, favorite frontend, systems, games, setup notes, and current status.
- Text and image posts.
- Home feed, profile posts, community posts, likes, comments, delete own posts, and report flows.
- User search, friend requests, accept/reject, friend list, block, and report.
- Community creation, discovery, join/leave, posting, pinned posts, creator/moderator controls, bans, and reports.
- Handheld identity badges and PocketCard-style setup profile.
- ThorLink dashboard with quick status, screenshot posting, friend activity, and compact dual-screen concept.
- Supabase migrations with RLS and Storage buckets.
- APK release documentation and secret scanning.

## Tech Stack

- React Native
- Expo SDK 55
- Expo Router
- TypeScript
- Supabase Auth, Postgres, Storage, and RLS
- AsyncStorage session persistence
- Jest, ESLint, Prettier

## Setup

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

## Supabase Setup

1. Create a Supabase project.
2. Apply migrations from `supabase/migrations`.
3. Confirm Storage buckets exist:
   - `avatars`
   - `banners`
   - `post-images`
   - `community-banners`
4. Confirm RLS is enabled on public tables.
5. Add the public Supabase URL and publishable key to `.env`.

With Supabase CLI:

```sh
supabase db push
```

## Run Locally

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

If Supabase env values are missing, PocketNet opens in local preview mode using seeded data so the UI can still be reviewed.

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

Expo dependency compatibility:

```sh
HOME=$PWD/.expo-home npm_config_cache=.npm-cache npx expo install --check
```

## Android APK Build

PocketNet is not intended for Google Play distribution in v1. Use EAS to produce signed APKs for GitHub Releases and the website.

Preview APK:

```sh
eas build --platform android --profile preview
```

Production APK:

```sh
eas build --platform android --profile production
```

Important:

- Keep package id `com.pocketnet.app`.
- Increment `android.versionCode` for every public APK.
- Keep signing keys out of git.
- Use the same signing certificate for updates.

See `docs/APK_RELEASE.md`.

## Sideload Install

1. Download the APK from the official GitHub Release or PocketNet website.
2. Open the APK on the Android handheld.
3. Allow installation from that source if Android asks.
4. Install PocketNet.
5. Disable unknown-source access again if desired.

## Repository Structure

```text
src/
  app/
  components/
  features/
  hooks/
  lib/
  types/
  assets/
supabase/
  migrations/
docs/
scripts/
tests/
```

## Security Practices

- `.gitignore` excludes env files, signing material, build output, local Supabase state, caches, and temporary files.
- The app uses public Supabase env values only.
- Service-role keys must never be used in the mobile app.
- RLS policies are included in the migration.
- Run `npm run check:secrets` before every commit and release.
- Inspect staged files before pushing.

## Known Limitations

- ThorLink does not use private or undocumented AYN hardware APIs.
- Current game status is manual in v1.
- Push notifications are not implemented yet; in-app notifications are included.
- Account deletion is documented as an admin process for beta.
- Production moderation workflows need an admin console or trusted backend in a later release.

## Roadmap

- Push notifications.
- Self-serve account deletion.
- Community moderator queue.
- Better image resizing/compression pipeline.
- Shareable PocketCard export.
- Native Android shortcuts for quick screenshot/status entry.
- Optional Thor-specific native module research if safe APIs become available.
