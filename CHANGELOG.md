# Changelog

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
