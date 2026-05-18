# PocketNet Design System

Updated: 2026-05-18

Design direction: **Premium Neon Handheld Social**.

PocketNet should feel like a beautiful OLED console-social layer for Android handheld players. It should be visual, smooth, social, and device-aware without becoming noisy or childish.

## Brand

PocketNet is beautiful, premium, playful but not childish, social, handheld-native, futuristic, cozy, gaming-focused, welcoming, and trustworthy.

## Visual Language

- Background: deep OLED navy/black with subtle cyan, violet, and magenta light.
- Gradients: layered and atmospheric, never cheap rainbow fills.
- Neon: used as edge light, active state, avatar ring, and selected device identity.
- Surfaces: glassy elevated cards with real depth, not flat gray boxes.
- Avatars: gradient rings, status dots, and strong fallback initials.
- Banners: rich media first; fallback banners use cinematic gradients.
- Badges: small glass chips with meaningful device/frontend/status labels.
- Navigation: floating console-like bottom bar with glow and strong touch targets.
- Empty states: designed cards with icon, copy, and next action.
- Motion: quick, smooth, subtle. Press scale, card reveal, shimmer, and reaction feedback.

## Color Tokens

| Token | Value | Use |
| --- | --- | --- |
| `bgBase` / `background` | `#04060D` | OLED app floor |
| `bgDeep` / `backgroundAlt` | `#070B16` | Secondary floor |
| `bgGradientStart` | `#03050C` | App gradient start |
| `bgGradientMid` | `#071225` | App gradient mid |
| `bgGradientEnd` | `#0B1022` | App gradient end |
| `surface` | `#101827` | Default surface |
| `surfaceSoft` / `surfaceStrong` | `#162033` | Strong surface |
| `surfaceGlass` | `rgba(18, 29, 48, 0.72)` | Glass cards |
| `surfaceGlow` | `rgba(33, 216, 255, 0.14)` | Skeletons/glows |
| `card` | `rgba(17, 25, 40, 0.88)` | Main card |
| `cardHover` / `cardPressed` | `rgba(27, 39, 60, 0.96)` | Pressed state |
| `borderSubtle` / `border` | `rgba(141, 167, 204, 0.16)` | Hairlines |
| `borderGlow` | `rgba(67, 220, 255, 0.48)` | Active glow border |
| `textPrimary` | `#F8FBFF` | Main text |
| `textSecondary` | `#C3CEE2` | Secondary text |
| `textMuted` | `#7E8BA4` | Metadata |
| `accentCyan` | `#43DCFF` | Primary energy |
| `accentBlue` | `#5F8BFF` | Actions/nav |
| `accentViolet` / `accentPurple` | `#A872FF` | Communities/device energy |
| `accentMagenta` / `accentPink` | `#FF6FD8` | Reactions/delight |
| `accentWarm` / `focus` | `#FFD27A` | Dual-screen/focus accent |
| `success` / `online` | `#54E9AA` | Success/activity |
| `warning` | `#FFD27A` | Pinned/warning |
| `danger` | `#FF5D7A` | Destructive |
| `offline` | `#66738B` | Offline |
| `overlay` | `rgba(2, 4, 10, 0.68)` | Media overlays |

## Typography

Use system fonts for Android reliability. Letter spacing stays `0`.

| Token | Size | Weight | Use |
| --- | ---: | ---: | --- |
| `display` | 36 | 900 | Welcome/rare hero |
| `heroTitle` | 32 | 900 | Profile/banner hero |
| `screenTitle` | 27 | 900 | Main screen title |
| `sectionTitle` | 20 | 900 | Feed sections |
| `cardTitle` | 17 | 900 | Card title |
| `body` | 15 | 500 | Body copy |
| `bodyStrong` | 15 | 800 | Names/emphasis |
| `caption` | 13 | 600 | Support copy |
| `metadata` | 12 | 600 | Username/time |
| `button` | 14 | 900 | Buttons |
| `badge` | 11 | 900 | Chips |
| `navLabel` / `tabLabel` | 11 | 800 | Nav |

## Spacing

Strict scale: `4, 8, 12, 16, 20, 24, 32, 40, 48`.

Rules:
- screen padding starts at `16`;
- important cards use `20`;
- repeated card gaps use `16`;
- compact handheld controls may use `8` or `12`;
- no random margins.

## Radius

| Token | Value | Use |
| --- | ---: | --- |
| `sm` | 12 | Inputs |
| `md` | 16 | Buttons/chips |
| `lg` | 22 | Media/cards |
| `xl` | 28 | Hero cards |
| `2xl` | 34 | Floating nav |
| `3xl` | 42 | Large hero |
| `pill` | 999 | Pills |
| `avatar` | 999 | Avatars |
| `card` | 26 | Premium cards |

## Shadow, Glow, Elevation

- Default cards use soft dark depth plus a subtle border.
- Glow cards use one accent border only; never stack multiple competing glows.
- Active tab, selected device, avatar ring, and primary action may glow.
- Normal metadata and dense lists should not glow.
- Pressed states scale to `0.968` and darken.

## Motion

- Press feedback: fast spring, subtle scale.
- Card entrance: 280ms fade/slide.
- Tabs: 220ms transition feel.
- Modal/sheet: 360ms when added.
- Skeleton: 900ms pulse.
- Like/reaction: quick scale pop, no bounce spam.
- Reduced-motion fallback: content remains readable and usable without animation.

## Component Rules

- Screens use gradient OLED background and floating nav space.
- Cards use `GlowCard` or `GlassCard` for premium surfaces.
- Buttons are pill-shaped, high contrast, and icon-led where useful.
- Inputs are glass controls with strong label hierarchy.
- Badges are meaningful and never decorative filler.
- Profile headers must be media-rich with overlapping avatar and device identity.
- Feed cards need author, device/frontend, post body/media, actions, and comments with clear rhythm.
- Community cards need banner/media treatment and an obvious join/open action.
- Device setup must show selected handheld, layout hint, accent, and suggested communities.

## Device Adaptation

Device profiles live in `src/design/deviceProfiles.ts`. Device choice controls badge style, copy, suggested communities, and layout intent:

- dual-screen handhelds use compact dashboards and focus accents;
- wide handhelds use media-forward balanced cards;
- compact handhelds use shorter cards and tighter metadata;
- tablet/large handhelds use more spacious rhythm.

Device adaptation must never fake native hardware control. Future native integrations need public Android APIs or explicit vendor-supported surfaces.

## No-Vibe-Code Checklist

- No plain black pages filled with bordered rectangles.
- No generic dashboard card grids.
- No unstyled raw lists.
- No cheap neon everywhere.
- No weak headings.
- No tiny unreadable metadata.
- No random inline colors.
- No inconsistent radius or spacing.
- No fake hardware claims.
- No empty states that look forgotten.
