# PocketNet Design System

Version: 0.2 frontend redesign
Updated: 2026-05-17

This file is the source of truth for PocketNet UI decisions. New components and screens should follow this document before inventing new styles.

## Brand Personality

PocketNet is:

- friendly;
- premium;
- handheld-native;
- social;
- playful but not childish;
- high-quality;
- gaming-tech but not edgy;
- cozy but professional;
- fun but not messy.

ThorLink is:

- slightly more futuristic;
- compact;
- Thor-specific;
- dual-screen inspired;
- technically polished;
- still visually part of PocketNet.

## Visual Direction

PocketNet uses an OLED-first dark interface with layered surfaces, crisp text, and controlled cyan/blue/purple accents.

Use:

- near-black and deep navy backgrounds;
- elevated dark cards;
- subtle gradients only where they create hierarchy;
- cyan, blue, and purple accent system;
- soft glow accents around high-value identity elements;
- modern avatar rings;
- clean iconography;
- high contrast text;
- spacious layouts;
- social-app-quality cards and profile surfaces.

Avoid:

- pure flat black everywhere;
- dull gray cards;
- random neon overload;
- inconsistent spacing;
- low contrast metadata;
- cheap gradients;
- generic dashboard layouts;
- childish gamer chrome;
- default Expo-looking buttons or inputs;
- cramped screens.

## Color Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `background` | `#05070D` | App floor, OLED-safe near-black |
| `backgroundAlt` | `#080C14` | Secondary app floor |
| `backgroundElevated` | `#0B1020` | Raised page regions |
| `surface` | `#101726` | Default component surface |
| `surfaceStrong` | `#151E31` | Strong card/header surface |
| `card` | `#121A2A` | Feed/profile/community cards |
| `cardPressed` | `#1A263B` | Pressed card/button state |
| `border` | `#26324A` | Hairline borders |
| `borderStrong` | `#38506F` | Focused/important borders |
| `textPrimary` | `#F8FBFF` | Primary copy |
| `textSecondary` | `#B8C4D8` | Secondary copy |
| `textMuted` | `#78869D` | Metadata, not critical |
| `accentCyan` | `#24D7FF` | Primary PocketNet accent |
| `accentBlue` | `#4B7DFF` | Actions, navigation |
| `accentPurple` | `#A875FF` | Social/community energy |
| `accentPink` | `#FF6BCB` | Rare delight/reaction accent |
| `success` | `#39E6A1` | Success and online-positive state |
| `warning` | `#FFD166` | Warnings, pinned content |
| `danger` | `#FF526B` | Destructive/report actions |
| `online` | `#3EF5B1` | Online/current activity |
| `offline` | `#65748B` | Offline/quiet state |
| `pending` | `#FFC857` | Pending requests |
| `verified` | `#74E5FF` | Verified/special trusted state |
| `thorlinkAccent` | `#7C5CFF` | ThorLink signature accent |

## Typography Scale

System fonts are used for Android reliability. Letter spacing is always `0`.

| Token | Size | Weight | Line height | Use |
| --- | ---: | ---: | ---: | --- |
| `display` | 34 | 900 | 40 | Rare brand display / welcome |
| `heroTitle` | 30 | 900 | 36 | ThorLink and auth hero |
| `screenTitle` | 26 | 900 | 32 | Main screen titles |
| `sectionTitle` | 19 | 800 | 24 | Feed/discovery sections |
| `cardTitle` | 16 | 800 | 21 | Card titles |
| `body` | 15 | 500 | 22 | Standard readable copy |
| `bodyStrong` | 15 | 800 | 22 | Names, emphasized body |
| `caption` | 13 | 600 | 18 | Supporting copy |
| `metadata` | 12 | 600 | 16 | Usernames, timestamps |
| `button` | 14 | 900 | 18 | Buttons |
| `badge` | 11 | 900 | 14 | Badges/pills |
| `tabLabel` | 11 | 800 | 14 | Bottom tabs |

## Spacing

Use this exact scale:

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

Default screen padding is `16`. Major card gaps are `16`. Dense widget gaps may use `8` or `12`.

## Radius

| Token | Value | Use |
| --- | ---: | --- |
| `xs` | 6 | Tiny chips and controls |
| `sm` | 10 | Inputs, small cards |
| `md` | 14 | Buttons, badges, compact cards |
| `lg` | 18 | Feed cards |
| `xl` | 24 | Profile/community hero cards |
| `2xl` | 30 | Auth/ThorLink hero surfaces |
| `pill` | 999 | Buttons, chips, status pills |
| `avatar` | 999 | Avatar circles |
| `card` | 20 | Default premium social card |

## Component Rules

### Buttons

- Primary buttons use `accentCyan` with near-black text, pill or 14px radius, 48px minimum height.
- Secondary buttons use `surfaceStrong`, `border`, and `textPrimary`.
- Ghost buttons are transparent with border or muted text, never low-contrast.
- Destructive buttons use danger-tinted surfaces and danger text/border.
- Icon buttons are at least 40x40 and include accessibility labels.
- Disabled state reduces opacity and should not look broken.

### Bottom Tabs

- Tabs use `surface` with a top hairline.
- Active tab uses cyan text/icon plus a small active rail or glow.
- Labels remain short and readable.
- Bottom tabs should feel console-like, not default Expo.

### Cards

- Default card: `card`, `border`, radius `card`, padding `16`.
- Important cards can use subtle gradient or glow, but must keep contrast.
- No cards nested inside decorative cards unless the nested card is a repeated item.
- Pressable cards scale slightly and darken.

### Profile Headers

- Banner takes visual priority.
- Avatar overlaps banner and uses an accent ring.
- Display name and username sit close to avatar.
- Bio is readable and not buried.
- Profile stats are compact and meaningful.
- Device/frontend/current game badges sit near identity, not at the bottom.
- Own profile uses edit CTA; other profiles use friend/report/block actions.

### Avatars

- Avatar rings communicate identity/status:
  - cyan for default PocketNet;
  - green for active/online;
  - purple/cyan blend for ThorLink.
- Avatar fallback uses initials, not blank silhouettes.

### Banners

- Banners should use user media when present.
- Fallback banners use premium dark gradients/patterns.
- Never leave a flat gray rectangle.

### Feed Posts

- Author row: avatar, display name, username/time, device/frontend badges.
- Body text should be readable and spacious.
- Images use stable aspect ratio, rounded corners, and dark placeholder.
- Action row uses icon + count with strong press feedback.
- Comments preview should be visually subordinate.

### Comments

- Comment cards are compact.
- Author name and body are clearly separated.
- Avoid raw borders that feel like admin UI.

### Community Cards

- Use banner/icon treatment and member count.
- Join/leave button must be visually obvious.
- Community description should be two to three lines max.
- Role badge appears when relevant.

### Friend/User Cards

- Avatar, display name, username, device/frontend badges, current status.
- Action button state should be clear: Add, Requested, Friends, Accept, Reject.
- Block/report remain available but not dominant.

### Search Bars

- Search bars use elevated surface, 48px height, left icon, and high contrast placeholder.
- Results empty state must be designed.

### Inputs and Text Areas

- Inputs use `surfaceStrong`, border, clear label, and focused accent border.
- Text areas have stable min-height and comfortable padding.
- Error text uses danger but does not shout.

### Empty States

- Empty states include an icon, title, useful body, and next action when possible.
- Empty states should feel like part of the product, not a missing state.

### Loading Skeletons

- Use a small number of skeleton rows.
- Skeletons pulse softly between dark surfaces.
- Avoid animating large lists of skeletons.

### Notifications

- Unread notifications use accent side rail/dot.
- Read notifications are quieter but still legible.
- Friend request notifications include direct actions.

### Badges

- Device badges use cyan/blue.
- Frontend badges use purple/blue.
- Current game uses pink/coral.
- Thor badges use `thorlinkAccent` + cyan.
- Badges use compact type and pill radius.

### Setup Cards / PocketCards

- PocketCards are profile-defining artifacts.
- Include device, frontend, favorite systems, games, and setup notes.
- Use a stronger visual frame than normal metadata.
- Must look shareable even before export exists.

### ThorLink Widgets

- Widgets are compact, dense, and glanceable.
- Use electric cyan/purple accents.
- Split "Top Screen" context from "Bottom Screen" controls.
- Quick actions are prominent: status and screenshot.
- Future integration notes must be honest and visually secondary.

## Motion Rules

- Motion is fast, smooth, and controlled.
- No random bouncing.
- Use press scale feedback for buttons/cards.
- Use subtle reveal animation for cards and hero sections.
- Use skeleton loading for fetch/loading states.
- Use composer image preview animation.
- Use like button feedback.
- Screen transitions should stay standard and stable unless a dedicated native animation is tested.
- Haptics can be added later; do not add unsafe/unavailable native assumptions now.

## Accessibility

- Minimum interactive target: 44x44.
- Metadata must remain readable.
- Avoid low-contrast gray-on-black abuse.
- Text should not scale with viewport width.
- Letter spacing is `0`.
- Empty/error states must explain next steps.
- Pressed and focused states must be visible.
- Do not rely on color alone for destructive actions.

## Implementation Guardrails

- Use `src/design/tokens.ts`.
- Use components from `src/components/ui` and `src/components/social`.
- Keep Supabase/data providers intact.
- Do not hardcode secrets.
- Do not add one-off colors in screens unless the token is missing and the design system is updated first.
- Preserve preview mode and real Supabase compatibility.
