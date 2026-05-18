# QA Checklist

Run this checklist before tagging a public beta.

## Automated

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run check:secrets`
- [ ] `HOME=$PWD/.expo-home npm_config_cache=.npm-cache npx expo install --check`

## Startup and Navigation

- [ ] App launches without a white screen.
- [ ] Preview mode opens when Supabase env values are missing.
- [ ] Login, signup, reset, onboarding, tabs, profile, settings, community, and user routes navigate correctly.
- [ ] Bottom tabs are readable and touch-friendly.

## Auth

- [ ] Sign up creates an auth user and profile row.
- [ ] Login persists session after app restart.
- [ ] Logout clears the session.
- [ ] Password reset sends email through Supabase.
- [ ] Missing Supabase config shows safe local preview behavior.

## Profiles and Media

- [ ] Edit username/display name/bio/region.
- [ ] Upload avatar.
- [ ] Upload banner.
- [ ] Favorite handheld/frontend/systems/games save.
- [ ] Currently playing and status save.
- [ ] Public profile displays PocketCard/setup info.

## Feed

- [ ] Create text post.
- [ ] Create image post.
- [ ] Home feed shows own posts, friends, and joined community posts.
- [ ] Like/unlike post.
- [ ] Comment on post.
- [ ] Delete own post.
- [ ] Report post.

## Friends and Safety

- [ ] Search users.
- [ ] Send friend request.
- [ ] Accept friend request.
- [ ] Reject friend request.
- [ ] Remove friend.
- [ ] Block user hides their content.
- [ ] Report user.

## Communities

- [ ] Create community.
- [ ] Search/discover community.
- [ ] Join community.
- [ ] Leave community.
- [ ] Post to community.
- [ ] Creator can pin posts.
- [ ] Creator can set/remove moderators.
- [ ] Creator can ban members.
- [ ] Moderator can delete community posts.
- [ ] Normal member cannot moderate others.
- [ ] Report community.

## Device Adaptation

- [ ] Onboarding asks for handheld device with a dropdown list.
- [ ] AYN Thor and AYANEO Pocket DS select the dual-screen profile.
- [ ] AYN Odin, Retroid, AYANEO Pocket, ANBERNIC, and Logitech devices select appropriate single-screen profiles.
- [ ] Home renders the selected device optimization card.
- [ ] Compact and dual-screen profiles keep feed cards readable on narrow width.

## APK

- [ ] EAS APK build completes.
- [ ] APK installs on Android.
- [ ] APK update works over the previous signed APK.
- [ ] Release notes include checksum and known limitations.

## Accessibility and UX

- [ ] Text remains readable on small handheld displays.
- [ ] Buttons are large enough for touch.
- [ ] Key actions have clear labels.
- [ ] Empty states are useful.
- [ ] Loading/error states do not trap the user.
