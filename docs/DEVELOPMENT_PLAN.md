# Development Planning Documentation

## Structure
Next.js routes live in `src/app`; patient/staff features are separated under `src/components`; Socket.io integration is isolated in `src/hooks/usePatientSocket.ts` and `src/lib/socket.ts`; the realtime server is `server/index.ts`.

## Realtime flow
Patient form changes are debounced by 250ms, emitted as `patient:update`, stored in the server session map, and broadcast only to the Socket.io room matching the patient session ID. Staff listens for `patient:snapshot` and updates React state immediately.

## Status
Active = activity within 30 seconds. Inactive = no activity for more than 30 seconds. Submitted = patient submitted the form.

## Production
Add persistent storage, authentication, authorization, server-side validation, rate limiting and appropriate security controls. Redis can be added as a Socket.io adapter when horizontally scaling.
