# PocketNet UI Redesign Research

Updated: 2026-05-18

PocketNet is standalone and is not affiliated with AYN, Cocoon, iiSU, Eden, Daijisho, ES-DE, Beacon, Discord, Instagram, X/Twitter, Reddit, Steam, PlayStation, Nintendo, Letterboxd, BeReal, VoltAgent, shadcn/ui, or React Native Reusables.

## What Was Studied

### Handheld, Emulator, and Launcher References

- Eden Emulator: slick Android-first presentation, touch-optimized controls, dark surfaces, strong settings hierarchy, and energetic but restrained accent color.
- Cocoon Shell / CocoonFE: 3DS-inspired handheld launcher culture, visual-first game presentation, themed media, and dual-screen context patterns.
- iiSU: dual-screen Android launcher research, quick-access grids, internal/external screen decisions, controller affordances, and asset-library structure.
- Daijisho: console-like Android frontend organization, metadata/artwork emphasis, fast browsing, and clean system grouping.
- ES-DE and Beacon: launcher/library behavior, cover art rhythm, controller-first navigation expectations, and non-Play APK distribution norms.
- Android handheld hardware: AYN Thor, AYN Odin family, Retroid devices, AYANEO Pocket devices, ANBERNIC Android handhelds, Logitech G Cloud, Razer Edge, Steam Deck as a large handheld reference, and generic Android phone/tablet controller setups.

Useful takeaways:

- Handheld UI works best when it feels like a console layer: clear navigation, big touch targets, strong media, and low-friction actions.
- Premium neon means edge light, selection glow, and depth. It does not mean random gradients everywhere.
- Device identity should be visible in profiles, feed cards, setup cards, onboarding, and discovery.
- Dual-screen devices need compact, glanceable surfaces and split-context thinking, but PocketNet must not fake private hardware control.

### Professional Social App Patterns

Studied principles from Discord, Instagram, Threads, X/Twitter, Reddit, Steam mobile, PlayStation app, Nintendo Switch Online, Letterboxd, and BeReal.

Useful takeaways:

- Every social card needs a human anchor: avatar, display name, username, status, and context.
- Feed rhythm should alternate identity, content, media, and actions without feeling like a database table.
- Profiles must feel authored: banner, avatar ring, bio, stats, social links, badges, and tabs.
- Communities need place identity: banner, icon, member count, join state, and an obvious reason to open.
- Empty states should give a next action, not just state that data is missing.

### Design-System References

Studied `VoltAgent/awesome-design-md`, `VoltAgent/awesome-claude-design`, shadcn/ui design-system habits, React Native Reusables, and modern NativeWind/Expo component organization.

Useful takeaways:

- Start with visual principles and semantic tokens before implementing screens.
- Define component behavior, not just color swatches.
- Keep variants limited and meaningful.
- Make every repeated social surface a component, not an inline one-off.
- Document "do not do this" rules so future work does not drift back into generic rectangles.

### Motion and Interaction

Studied React Native Animated/Reanimated patterns, Moti-style skeletons, premium mobile press feedback, reaction feedback, card reveals, image preview transitions, and tab transitions.

Useful takeaways:

- Motion should confirm intent, not perform.
- Press feedback should be fast and subtle.
- Skeletons should look designed and calm.
- Like/reaction motion can pop once, then get out of the way.
- Heavy bounce, slow motion, and random movement make the app feel cheaper.

## What Made The Previous UI Bad

- Too many flat bordered rectangles with weak depth.
- Generic card rhythm that could belong to any CRUD app.
- Weak typography hierarchy.
- Dull gray-on-black surfaces.
- Badges that looked like cheap labels instead of identity pieces.
- Little motion or press feedback.
- Profiles were not visually memorable.
- Communities felt like rows, not places.
- Device-specific behavior was separated instead of built into onboarding and profile identity.

## Final Design Direction

The direction is **Premium Neon Handheld Social**.

PocketNet should look like a polished OLED social layer for handheld gaming:

- deep navy/black background with subtle cyan, blue, violet, and magenta light;
- glassy elevated cards with soft shadow and selective glow;
- strong avatar rings, banners, and media treatment;
- device and frontend badges as identity primitives;
- floating console-like tab navigation;
- compact but readable handheld density;
- richer empty/loading/error states;
- fast, tasteful motion.

## Device-Adaptive UX

PocketNet now asks users to choose a handheld during onboarding and settings. The selected device drives:

- profile device badge;
- setup/PocketCard copy;
- feed/dashboard language;
- suggested communities;
- density intent for compact, wide, large, and dual-screen handheld classes;
- accent treatment for device-focused cards.

This is deliberately frontend-safe. PocketNet does not claim native display control or private vendor integration. Future native work should be explicit, documented, and based on public Android APIs or supported integrations.

## What To Avoid

- Plain black pages filled with rectangles.
- Fake console/hardware claims.
- Generic social-template layout.
- Overuse of cheap neon.
- Random inline colors.
- Tiny metadata.
- Weak profile pages.
- Boring community cards.
- Unstyled lists.
- Empty states without an action.

## No-Vibe-Code Checklist

- Every major screen has a clear hero/header, body rhythm, and primary action.
- Feed cards have author identity, device identity, content, media, actions, and comments.
- Profiles show banner, overlapping avatar, badges, stats, setup, and tabs.
- Communities show banner, identity, membership state, and posts.
- Onboarding includes handheld selection and a live device preview card.
- Buttons, cards, badges, inputs, empty states, skeletons, and nav use shared tokens.
- Motion is subtle, fast, and functional.
- The old separated device-specific tab has been removed; device adaptation is part of the whole app.
