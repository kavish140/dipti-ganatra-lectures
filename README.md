# Meet Lecture App

This project runs the public lecture site for Dr. Dipti Ganatra at `meet.drdiptiganatra.com`.

## Free live lecture setup

The live classroom uses the free public Jitsi service by default:

- Doctor starts the lecture from `/admin`
- Attendees join from the public lecture page
- Screen sharing, camera, and microphone are supported by Jitsi
- No paid conferencing account is required for the default setup

## Important note

`meet.drdiptiganatra.com` hosts the website UI, not the video server itself. The actual conference runs through Jitsi's public infrastructure.

## Required environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PASSWORD`

Optional backend secrets used only if you extend the app:

- `SUPABASE_SERVICE_ROLE_KEY`
- EmailJS / WhatsApp keys for notification flows
