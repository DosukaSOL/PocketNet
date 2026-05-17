# Security

PocketNet is designed for APK distribution and public collaboration, so repository hygiene matters.

## Secrets

Never commit:

- `.env` or `.env.*` with real values.
- Supabase service-role keys.
- Database passwords.
- API tokens.
- Signing keystores or signing passwords.
- Private keys.

The mobile app may use only public-safe Supabase values:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Service-role operations belong on trusted backend infrastructure, not in this app.

## Secret Scanning

Run before every commit and release:

```sh
npm run check:secrets
```

Also inspect staged files:

```sh
git diff --cached --name-only
git diff --cached
```

## Supabase RLS

All public tables in `supabase/migrations/20260517190000_initial_schema.sql` enable RLS. Policies enforce profile ownership, friend request participants, community moderation roles, owner-scoped storage paths, and reporter-only report visibility.

Client-side permission checks are for UX. RLS is the enforcement layer.

## Signing

APK signing material is ignored by git and must be stored outside the repository. Losing the signing key means users may not be able to update existing APK installs with the same package id.

## Dependency Notes

`npm audit --omit=dev` currently reports moderate findings through Expo SDK 55 toolchain dependencies. The suggested automatic fix downgrades Expo across major SDK lines and is not safe for this app. Track Expo SDK updates and re-run audit before each release.

## Reporting Vulnerabilities

Open a private security advisory or contact the maintainers directly. Do not post exploit details in public issues before a fix is available.
