# PocketNet UI QA Checklist

Updated: 2026-05-18

This checklist covers the frontend redesign pass for PocketNet and ThorLink. It focuses on visual polish, handheld ergonomics, interaction quality, and data-flow safety.

## What Changed In This Pass

- Added a PocketNet design system with tokens, typography, spacing, radius, component, motion, and accessibility rules.
- Added reusable UI primitives for screens, cards, buttons, inputs, avatars, badges, empty states, skeletons, segmented tabs, and stats.
- Added social components for posts, profiles, users, communities, notifications, setup cards, status composer, and ThorLink widgets.
- Redesigned auth, signup, password reset, onboarding, home feed, composer, profile, public profile, discovery, community detail, ThorLink, settings, and edit profile screens.
- Preserved existing Supabase Auth, profile, media upload, posts, friends, communities, moderation, and preview-mode data flows.

## Visual QA

- [x] OLED-first near-black app shell is applied through shared screen and card surfaces.
- [x] PocketNet uses a cohesive cyan, blue, purple, and pink accent system instead of random one-off colors.
- [x] Auth screens present a premium PocketNet entry point with logo, hero copy, and clear account actions.
- [x] Home feed has a real hero, stats, notifications, requests, active friends, loading skeletons, and designed empty state.
- [x] Post cards include author identity, badges, post content, image preview, reactions, comments, report/delete controls, and press feedback.
- [x] Composer includes destination selection, disabled submit state, image preview, remove image action, and character count.
- [x] Profile screens include banner, overlapping avatar, status ring, social badges, stats, PocketCard, and tabs.
- [x] Community screens include banner identity, member/post stats, join/leave state, moderation controls, pinned posts, and member cards.
- [x] ThorLink has a distinct but compatible visual treatment with stronger cyan/purple energy and compact dashboard widgets.
- [x] Settings are grouped by account, security, privacy, notifications, appearance, session, and version info.

## Interaction QA

- [x] Buttons use shared press-scale feedback.
- [x] Cards, tabs, chips, and icon buttons have clear pressed or selected states.
- [x] Pull-to-refresh is wired on the home feed through the shared Screen component.
- [x] Auth errors render inline instead of only relying on alerts.
- [x] Profile, discovery, community, and settings navigation routes remain connected.
- [x] Like actions keep the existing data path and add subtle feedback.
- [x] Image selection/removal remains connected to the existing media picker and upload flow.
- [x] Community creator/moderator actions remain connected to existing permission helpers.

## Data Flow QA

- [x] Existing `useAuth` flows remain in place: sign in, sign up, password reset, sign out, preview mode, onboarding, profile patching.
- [x] Existing `usePocketData` flows remain in place: refresh, feeds, search, posts, likes, comments, friends, communities, reports, blocks.
- [x] No Supabase service-role logic was added to the mobile client.
- [x] No schema migration was required for the UI redesign.
- [x] Preview-mode seed data still powers visual QA when Supabase env values are absent.

## Android Handheld QA

- [ ] Install on a real Android handheld and verify bottom navigation thumb reach.
- [ ] Test portrait and landscape on a handheld-sized viewport.
- [ ] Verify text wrapping for long usernames, community names, and badges.
- [ ] Verify image picker and upload UI on Android 13+ permissions.
- [ ] Verify pull-to-refresh and scroll performance on a lower-powered handheld.
- [ ] Verify OLED contrast in a dim room and under bright ambient light.
- [ ] Verify controller-adjacent ergonomics where the device also has touch controls.

## Thor-Specific QA

- [x] ThorLink no longer reads like a placeholder; it has a dedicated mode, dashboard, quick status, screenshot share, active friends, and glance feed.
- [x] ThorLink copy avoids claiming unavailable native hardware integrations.
- [x] ThorLink sets `isThorUser` and `favoriteHandheld` only through the existing profile update path.
- [ ] Test on AYN Thor hardware when available.
- [ ] Verify dual-screen/clamshell readability with real device aspect ratios.
- [ ] Validate whether future native modules can expose device posture or secondary-display state safely.

## Automated Checks

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run check:secrets`
- [x] `npx expo export --platform web --output-dir dist-web`

## Known Issues / Follow-Ups

- Real Supabase production QA is still required before public beta.
- Real Android APK install, update, and signing validation are still required before release.
- Push notifications remain documented future work.
- Theme switching is not implemented yet; PocketNet currently ships one OLED-first theme.
- Native Thor hardware detection is intentionally not faked in v1.
