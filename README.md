# Agnos Candidate Assignment — Socket.io

Real-time patient form and staff monitoring built with Next.js, TypeScript, Tailwind CSS and Socket.io.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open `http://localhost:3000/patient` in one or more tabs and `http://localhost:3000/staff` in another. Each patient tab gets its own session id; Staff sees every session update live, without refresh.

## Environment
`NEXT_PUBLIC_SOCKET_URL=http://localhost:4000`

## Deployment
Deploy Next.js to Vercel and the Socket.io server to Render or another WebSocket-compatible service.

- On Vercel, set `NEXT_PUBLIC_SOCKET_URL` to the deployed socket server's URL (e.g. `https://agnos-socket-server.onrender.com`). This is a build-time variable — redeploy after changing it.
- On the socket server (Render), set `FRONTEND_URL` to the deployed Vercel URL so CORS allows it.

Without both of these set to real deployed URLs, the app falls back to `http://localhost:4000`, which the visitor's browser can't reach — both pages will sit on "Connecting…" indefinitely instead of reaching "Connected".

## Architecture
Patient Browser -> Socket.io -> Node.js Server -> per-session Socket.io room -> Staff Browser.

Each patient session gets a unique id (generated client-side, stored in `sessionStorage`), so multiple patients can fill out forms concurrently without colliding. The server keeps all sessions in memory and broadcasts updates both to the owning patient's room and to a `staff` room that the dashboard joins. Both the patient and staff sockets rejoin their room on every reconnect, not just the first connect, so a dropped connection recovers without a page refresh.

## Trade-offs and what production would add
This is a take-home-scoped demo, so a few things are deliberately simplified:

- **In-memory session storage.** `server/index.ts` keeps all sessions in a plain `Map`, so a server restart or a second server instance loses/splits state. Production would move this to a shared store (Postgres/Redis) and add a Socket.io Redis adapter so the app can run multiple server instances behind a load balancer.
- **No authentication or authorization.** Anyone with a session id can join that room, and anyone can open `/staff`. Production needs patient identity verification and staff auth (e.g. hospital SSO) before this ever touches real patient data.
- **No server-side rate limiting or input sanitization beyond Zod.** The client validates with Zod, but the server trusts whatever `patient:update` payload it receives. Production should re-validate server-side and rate-limit per session.
- **No audit trail.** Sessions are overwritten in place; there's no history of what changed or when, which a real clinical intake tool would need for compliance.
