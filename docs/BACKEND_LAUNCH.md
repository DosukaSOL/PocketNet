# PocketNet Backend Launch Notes

Updated: 2026-05-18

## Current Backend Status

PocketNet is now connected to a live Supabase free-tier project.

Applied migrations:

- `pocketnet_initial_schema`
- `backend_hardening`
- `revoke_anon_function_access`

Provisioned backend pieces:

- Supabase Auth profile trigger.
- Public schema tables for profiles, friendships, friend requests, blocks, communities, memberships, posts, post images, comments, reactions, notifications, and reports.
- Row Level Security on all PocketNet public tables.
- Storage buckets for avatars, banners, post images, and community banners.
- Owner-scoped Storage policies.
- Public-safe Supabase URL/key configured locally in ignored `.env`.
- Public-safe Supabase build values set in GitHub repository secrets.

No Supabase service-role key is used by the mobile app or committed to the repo.

## Do We Need A Separate Backend Server?

For the first public beta: **no separate backend server is required**.

Supabase is currently the backend server:

- Auth handles accounts, sessions, login, signup, and password reset.
- Postgres stores profiles, posts, comments, friends, communities, reports, and notifications.
- Storage stores user-uploaded images.
- RLS is the security boundary.

Future backend/server work may be useful for moderation review, report escalation, push notifications, account deletion, self-update metadata, transactional email, server-side media moderation/compression, and analytics aggregation.

Those can be implemented later with Supabase Edge Functions, a small admin app, or a separate server. They are not required for the first APK build.

## Free-Tier Notes

The free Supabase tier is enough for a closed or early public beta, but it has practical limits:

- projects can pause after inactivity;
- database, Storage, bandwidth, and Auth quotas are limited;
- no production SLA;
- heavy media uploads can exhaust Storage/bandwidth quickly.

Before a larger launch, revisit Supabase usage and decide whether to move to a paid plan.

## Remaining Required Manual Setup

- Configure Supabase Auth email templates and allowed redirect URLs.
- Decide whether email confirmation should stay enabled.
- Test real signup/login/password reset on device.
- Add `EXPO_TOKEN` to GitHub repository secrets.
- Configure EAS project credentials and Android signing.
- Build a signed APK and publish it through GitHub Releases.
