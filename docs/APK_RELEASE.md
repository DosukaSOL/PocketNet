# APK Release Guide

PocketNet is distributed outside Google Play. Releases should be signed APKs published through GitHub Releases and the PocketNet website.

## Rules

- Keep package id stable: `com.pocketnet.app`.
- Increment `android.versionCode` in `app.config.ts` for every public APK.
- Keep the same signing certificate for updates.
- Never commit `.jks`, `.keystore`, `.p12`, `.pem`, signing passwords, or `keystore.properties`.
- Run `npm run qa` and `npm run check:secrets` before release.

## Local Prep

1. Copy `.env.example` to `.env` and fill only public Supabase values.
2. Confirm Supabase migrations are applied.
3. Confirm no signing files are inside the repo.
4. Update `CHANGELOG.md`.
5. Update `version` and `android.versionCode` in `app.config.ts`.

## Build APK

Install EAS CLI if needed:

```sh
npm install -g eas-cli
```

Create an internal APK:

```sh
eas build --platform android --profile preview
```

Create a production APK:

```sh
eas build --platform android --profile production
```

For local native builds, generate Android project files only when needed:

```sh
npx expo prebuild --platform android
```

Generated native folders are ignored by default to avoid accidental signing-file commits.

## Release Checklist

- APK installs on a clean Android handheld.
- Existing install updates successfully from previous signed APK.
- Login/signup/reset tested against production Supabase.
- Profile avatar/banner upload tested.
- Post image upload tested.
- Friends, communities, reports, blocks, and ThorLink tested.
- APK SHA-256 checksum generated and included in release notes.
- No `.env`, keystore, or credentials are staged.

Generate checksum:

```sh
shasum -a 256 PocketNet-v0.1.0.apk
```

## Sideload Instructions for Users

1. Download the APK from the official GitHub Release or PocketNet website.
2. Open the APK on the Android handheld.
3. Allow installation from that source if Android asks.
4. Install PocketNet.
5. Disable unknown-source access again if desired.

Users should not install APKs from unofficial mirrors.
