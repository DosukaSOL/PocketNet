# PocketNet Architecture

## Overview

PocketNet is an Expo Router Android app backed by Supabase Auth, Postgres, Storage, and Row Level Security. It is structured to run in two modes:

- Supabase mode: production beta behavior with real auth, profiles, posts, communities, media uploads, and RLS-backed data access.
- Preview mode: local seeded data for design and QA when Supabase env values are not configured.

The preview mode is intentionally local and should not be treated as production persistence.

## App Structure

- `src/app`: Expo Router routes.
- `src/components`: reusable OLED-first UI primitives and cards.
- `src/features/auth`: Supabase session/profile provider.
- `src/features/social`: PocketNet social data provider and operations.
- `src/lib`: Supabase client, media upload, mappers, theme, catalog data, moderation helpers.
- `src/types`: shared domain types.
- `supabase/migrations`: database schema, storage buckets, and RLS policies.
- `scripts`: safety automation such as secret scanning.
- `tests`: focused logic and repo-safety tests.

## Navigation

Primary tabs:

- Home: feed, notifications, friend requests.
- Discover: users, communities, community creation.
- Post: text/image post composer.
- ThorLink: AYN Thor-focused compact dashboard.
- Profile: current profile, friends, profile posts.

Supporting routes:

- Auth: login, signup, reset, onboarding.
- Community detail: membership, posts, moderation actions.
- User profile: public profile, friend request, block/report.
- Edit profile and settings.

## Data Model

Core tables:

- `profiles`
- `friend_requests`
- `friendships`
- `blocks`
- `communities`
- `community_memberships`
- `posts`
- `post_images`
- `comments`
- `post_reactions`
- `notifications`
- `reports`

Storage buckets:

- `avatars`
- `banners`
- `post-images`
- `community-banners`

## Security Model

The mobile app uses only public-safe Supabase values:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The mobile app must never receive Supabase service-role keys, database passwords, signing keystores, or private API tokens.

RLS is enabled on all public tables. Client checks improve UX, but database policies are the enforcement boundary. Community creators can manage roles and bans. Creators and moderators can moderate community posts. Normal members can post, like, comment, join, and leave.

## ThorLink

ThorLink is implemented as a first-class app section, not a fake hardware integration. Current capabilities:

- Thor profile mode.
- Thor badge/status updates.
- Compact dashboard for feed, friends, and screenshot posting.
- Dual-screen-friendly layout concept with top/bottom screen panels.

Future native work could add device detection, Android window metrics, launcher shortcuts, and deeper integrations with Thor-specific system tools if AYN exposes safe APIs or intent surfaces.

## Release Strategy

PocketNet is APK-distributed through GitHub Releases and a website. The package id is `com.pocketnet.app`. APK updates require the same signing certificate and incremented `android.versionCode`.

Use EAS build profile `preview` or `production` for APK generation. Signing keys stay outside git.
