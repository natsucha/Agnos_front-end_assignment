# Development Planning Documentation

## Structure
Next.js routes live in `src/app`; patient/staff features are separated under `src/components`; Socket.io integration is isolated in `src/hooks/usePatientSocket.ts`, `src/hooks/useStaffSocket.ts` and `src/lib/socket.ts`; the realtime server is `server/index.ts`.

## Realtime flow
Each patient tab generates its own session id (`src/lib/session.ts`, persisted in `sessionStorage`) so multiple patients can be monitored at once instead of sharing one session.

Patient form changes are debounced by 250ms, emitted as `patient:update`, stored in the server's session map, and broadcast to two places: the Socket.io room matching that patient's session id (`patient:snapshot`, so the patient's own tab stays in sync), and a shared `staff` room (`session:update`) that every staff dashboard has joined via `staff:join`. Staff receives the full session list on join (`sessions:snapshot`) and then just the changed session on every update, updating React state immediately without a page refresh.

## Status
Active = activity within 30 seconds. Inactive = no activity for more than 30 seconds. Submitted = patient submitted the form. The Staff dashboard shows a Total/Active/Inactive/Submitted summary across all sessions plus a per-session status badge, and lists sessions in the stable order they first joined (not re-sorted by last activity, so rows don't jump around as patients type).

## Connection resilience
Both `usePatientSocket` and `useStaffSocket` expose a three-state `connectionStatus` (`connecting` / `connected` / `reconnecting`) instead of a plain boolean, rendered by the shared `ConnectionBadge` component. The socket client (`src/lib/socket.ts`) is configured with unlimited reconnection attempts and both transports (websocket + polling fallback). On every `connect` event — including reconnects after a dropped connection, not just the first one — the client re-emits its room-join event (`session:join` / `staff:join`), since Socket.io rooms are tied to the server-side socket instance and a reconnect gets a new one.

## Production
Add persistent storage (the server currently keeps sessions in an in-memory `Map`), authentication, authorization, server-side validation, rate limiting and appropriate security controls. Redis can be added as a Socket.io adapter when horizontally scaling. See the README's "Trade-offs" section for the full list of what's deliberately out of scope for this demo.
