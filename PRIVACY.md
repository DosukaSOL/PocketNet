# Privacy

PocketNet is a social app for handheld gaming users. Profile content, posts, comments, likes, and community membership may be visible to other users.

## Data Users Provide

PocketNet may store:

- Email address for authentication.
- Username and display name.
- Profile picture and banner.
- Bio, region, social links, favorite handheld/frontend/systems/games.
- Setup notes and manual currently-playing status.
- Posts, images, comments, likes, communities, reports, blocks, and friend relationships.

## What PocketNet Does Not Do in v1

- It does not automatically scan installed apps or game libraries.
- It does not automatically detect what game a user is playing.
- It does not require contacts access.
- It does not use Supabase service-role keys in the mobile app.

## Media

Uploaded media is stored in Supabase Storage buckets. Users should avoid uploading private screenshots or personal information.

## Moderation

Users can block and report users, posts, comments, and communities. Reports are used for moderation review.

## Account Removal

For beta, account removal should be handled by an admin process in Supabase. A self-serve deletion flow is planned for a later release.
