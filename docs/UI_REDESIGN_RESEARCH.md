# PocketNet UI Redesign Research

Research completed: 2026-05-17

PocketNet is standalone and is not affiliated with AYN, Cocoon, Daijisho, ES-DE, Beacon, Discord, X/Twitter, Instagram, Reddit, Steam, PlayStation, Nintendo, Letterboxd, BeReal, VoltAgent, shadcn/ui, or React Native Reusables.

## What Was Studied

### DESIGN.md structure

Studied:

- `VoltAgent/awesome-design-md`
- `VoltAgent/awesome-claude-design`
- Representative `DESIGN.md` files for Claude and PlayStation-inspired systems

Useful structure patterns:

- Start with atmosphere: what the interface should feel like and why.
- Define semantic tokens before component styling.
- Include typography, spacing, radius, elevation, and density rules.
- Describe components as behavioral objects, not just swatches.
- Include "do / avoid" guardrails so future screens stay on-system.
- Document responsive behavior and touch targets.
- Keep rationale next to rules so implementation decisions remain consistent.

Applied to PocketNet:

- PocketNet gets its own original `docs/DESIGN.md`, not a borrowed brand.
- The design system uses semantic app tokens, social components, motion rules, and anti-slop constraints.
- The system is written for React Native implementation, not marketing pages.

### React Native UI systems

Studied:

- `founded-labs/react-native-reusables`
- shadcn/ui component philosophy
- Expo app structure and copy-owned component patterns

Useful principles:

- Own the primitives. Do not hide key UI behavior inside opaque third-party widgets.
- Build small typed primitives: Button, Card, Avatar, Badge, Input, EmptyState, Skeleton, Tabs.
- Compose social components from primitives: PostCard, ProfileHeader, CommunityCard, UserCard, SetupCard, NotificationCard.
- Variants should be limited and meaningful. Too many variants create inconsistency.
- A React Native design system needs tokenized spacing/radius/type, not scattered inline values.

Applied to PocketNet:

- New design tokens live in `src/design/tokens.ts`.
- Reusable UI components live under `src/components/ui`.
- Social app components live under `src/components/social`.
- Legacy imports are kept compatible where useful, but the visual implementation moves to the new system.

### Professional social/profile/community app patterns

Studied as product references, not as clone targets:

- Discord: dense but friendly social surfaces, status, community identity, avatars, live presence.
- X/Twitter and Threads: fast feed scanning, compact author metadata, action rows.
- Instagram: strong profile headers, image previews, identity-first layout.
- Reddit: community cards, join states, post/comment hierarchy.
- Steam mobile / PlayStation app / Nintendo Switch Online: dark gaming identity, product polish, account/profile hierarchy.
- Letterboxd: tasteful badges, stats, lists, profile personality.
- BeReal: informal social warmth and quick composer energy.

Useful principles:

- Social surfaces need human anchors: avatar, display name, username, status, context.
- Feed cards should have clear author hierarchy and scannable actions.
- Profile pages must feel authored by the user: banner, avatar ring, bio, stats, setup card, tabs.
- Communities should feel like places, not database rows.
- Empty states should suggest the next social action.
- Metadata must be legible but quiet.

Applied to PocketNet:

- Posts show avatar rings, display name, username, handheld/frontend badges, body/media, reactions, comments.
- Profiles get overlapping avatar treatment, stats, setup card, social links, and segmented tabs.
- Discovery uses user/community cards with clear action states.
- Notifications become polished cards, not plain text.

### Motion and microinteractions

Studied:

- React Native core `Animated` API
- React Native Reanimated entering/press/spring patterns
- Moti skeleton loader patterns
- Social app motion conventions

Useful principles:

- Motion should confirm action, not perform for its own sake.
- Press feedback should be fast and subtle: scale down 0.97-0.99, opacity change, immediate return.
- Feed/card reveals should be brief and restrained.
- Skeletons should imply loading without rendering too many animated rows.
- Composer image preview should animate in/out to make media selection feel intentional.

Applied to PocketNet:

- Use lightweight animated press surfaces.
- Add subtle skeleton components and reveal wrappers.
- Add like/composer/status action feedback without gimmicks.
- Avoid random bounces and heavy animation stacks.

### Handheld gaming and ThorLink UX

Studied:

- AYN Thor dual-screen / clamshell positioning from prior PocketNet research.
- CocoonFE README and visible product positioning: Android emulation frontend, 3DS inspiration, dual-screen/screen-swapping emphasis.
- Android handheld frontend expectations: Cocoon, Daijisho, ES-DE, Beacon.
- OLED and controller/touch ergonomics.

Useful principles:

- Handheld UI should feel compact, glanceable, and high contrast.
- Dual-screen concepts should respect the split: top for context/detail, bottom for controls/status/activity.
- Gaming identity should be premium, not aggressive neon.
- Badges should carry real meaning: device, frontend, systems, current game.
- The UI should remain usable one-handed/two-thumb on small displays.

Applied to PocketNet:

- OLED-first near-black backgrounds with layered dark surfaces.
- Cyan/blue/purple accents are used as identity and state, not wallpaper.
- ThorLink receives slightly more electric cyan/purple energy and compact widget density.
- Device/frontend badges are standard identity primitives across the app.

## What PocketNet Should Visually Feel Like

PocketNet should feel:

- premium but approachable;
- social and profile-driven;
- handheld-native;
- OLED-first;
- gaming-tech without being edgy;
- cozy but not beige;
- fun without being childish;
- polished enough to come from a funded startup.

The experience should feel like opening a console social layer made for people who care about their handheld setup.

## What To Avoid

- Generic CRUD cards with raw labels.
- Flat gray-on-black admin UI.
- Random neon overload.
- Facebook-like feed chrome.
- Fake hardware claims.
- Tiny unreadable metadata.
- Over-animation.
- Repeating one-off styles in screens.
- Placeholder copy that sounds unfinished.

## ThorLink Visual Direction

ThorLink should be recognizably PocketNet but tuned more technical:

- more compact widgets;
- stronger cyan/purple energy;
- dual-screen metaphors;
- quick status and screenshot actions;
- friend activity at a glance;
- future integration notes framed as roadmap, not fake features.

ThorLink should feel like a flagship section, not a settings page.

## Practical Redesign Decisions

- Create PocketNet-owned tokens and components.
- Keep backend/data providers intact.
- Keep Supabase contracts and preview data intact.
- Use existing logos as visual anchors.
- Redesign all major screens around social hierarchy.
- Use animated press/reveal/skeleton primitives.
- Add profile tabs and better setup cards.
- Add richer empty/loading/error states.
- Keep text contrast high and touch targets large.
- Update QA docs with visual, interaction, data, handheld, and Thor-specific checks.
