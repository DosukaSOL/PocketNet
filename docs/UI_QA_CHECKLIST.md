# PocketNet UI QA Checklist

Updated: 2026-05-18

This checklist covers the Premium Neon Handheld Social redesign. It focuses on visual polish, handheld ergonomics, interaction quality, animation restraint, and data-flow safety.

## What Changed In This Pass

- Replaced the old separated device-specific tab with device-adaptive onboarding, profile identity, cards, copy, and layout hints.
- Added/updated design tokens, motion rules, device profiles, UI primitives, social components, and device components.
- Redesigned auth, signup, password reset, onboarding, home feed, composer, profile, public profile, discovery, community detail, settings, and edit profile surfaces.
- Expanded supported handheld profiles: AYN Thor, AYN Odin 2/3, AYN Odin 2 Portal, Retroid Pocket devices, AYANEO Pocket devices, ANBERNIC RG556, Logitech G Cloud, Razer Edge, Steam Deck, Android phone/tablet, and custom handheld.
- Preserved Supabase Auth, profile, media upload, posts, friends, communities, moderation, and preview-mode data flows.

## Visual QA

- [x] OLED-first deep navy/black app shell is applied through shared screen and card surfaces.
- [x] PocketNet uses cyan, blue, violet, magenta, and warm device-focus accents with restraint.
- [x] Auth screens present the PocketNet logo, premium hero, clear account actions, and safe preview mode.
- [x] Onboarding includes handheld selection and a live device profile preview.
- [x] Home feed has a command bar, device card, stats, notifications, requests, active friends, skeletons, and designed empty state.
- [x] Post cards include author identity, badges, post content, image preview, reactions, comments, report/delete controls, and press feedback.
- [x] Composer includes destination selection, disabled submit state, image preview, remove image action, loading state, and character count.
- [x] Profile screens include banner, overlapping avatar, status ring, social badges, stats, PocketCard, and tabs.
- [x] Community screens include banner identity, member/post stats, join/leave state, moderation controls, pinned posts, and member cards.
- [x] Settings are grouped by account, security, privacy, notifications, appearance, session, and version info.

## Interaction QA

- [x] Buttons use shared press-scale feedback.
- [x] Cards, tabs, chips, and icon buttons have clear pressed or selected states.
- [x] Pull-to-refresh is wired on the home feed.
- [x] Auth errors render inline.
- [x] Profile, discovery, community, edit profile, and settings navigation routes remain connected.
- [x] Like actions keep the existing data path and add subtle feedback.
- [x] Image selection/removal remains connected to the existing media picker/upload flow.
- [x] Community creator/moderator actions remain connected to existing permission helpers.

## Animation QA

- [x] Feed cards use controlled reveal animation.
- [x] Pressable surfaces scale subtly.
- [x] Like/reaction feedback pops once without noisy bounce.
- [x] Skeleton loading pulses calmly.
- [x] Image preview uses the shared image preview surface.
- [ ] Test reduced-motion behavior on a real Android device.

## Data Flow QA

- [x] Existing `useAuth` flows remain in place: sign in, sign up, password reset, sign out, preview mode, onboarding, profile patching.
- [x] Existing `usePocketData` flows remain in place: refresh, feeds, search, posts, likes, comments, friends, communities, reports, blocks.
- [x] No Supabase service-role logic was added to the mobile client.
- [x] No schema migration was required for this UI pass.
- [x] Preview-mode seed data still powers visual QA when Supabase env values are absent.

## Android Handheld QA

- [ ] Install on a real Android handheld and verify bottom navigation thumb reach.
- [ ] Test portrait and landscape on handheld-sized viewports.
- [ ] Verify text wrapping for long usernames, community names, and badges.
- [ ] Verify image picker and upload UI on Android 13+ permissions.
- [ ] Verify pull-to-refresh and scroll performance on lower-powered handhelds.
- [ ] Verify OLED contrast in dim and bright environments.
- [ ] Verify controller-adjacent ergonomics where touch and physical controls are both present.

## Device-Adaptive QA

- [x] The old separated device mode is removed from bottom navigation.
- [x] Onboarding asks users to choose their handheld from a dropdown list.
- [x] Device adaptation copy avoids claiming unavailable native hardware integrations.
- [x] Dual-screen devices map to compact focus-accent guidance.
- [x] Wide handhelds map to balanced media-forward guidance.
- [x] Large/tablet handhelds map to spacious guidance.
- [ ] Test on AYN Thor or another dual-screen/clamshell Android handheld when available.
- [ ] Verify dual-screen readability with real aspect ratios.
- [ ] Validate whether future native modules can expose posture/window/display state safely.

## Automated Checks

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run check:secrets`
- [x] `HOME=$PWD/.expo-home npm_config_cache=.npm-cache npx expo install --check`
- [x] `HOME=$PWD/.expo-home npm_config_cache=.npm-cache npx expo export --platform web --output-dir dist-web`

## Known Issues / Follow-Ups

- Real Supabase production QA is still required before public beta.
- Real Android APK install, update, and signing validation are still required before release.
- Push notifications remain documented future work.
- Theme switching is not implemented yet; PocketNet currently ships one OLED-first theme.
- Native hardware detection is intentionally not faked in v1.
