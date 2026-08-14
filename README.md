# Agnos Candidate Assignment — Socket.io

Real-time patient form and staff monitoring built with Next.js, TypeScript, Tailwind CSS and Socket.io.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open `http://localhost:3000/patient` and `http://localhost:3000/staff` in two tabs. Patient changes appear on Staff without refresh.

## Environment
`NEXT_PUBLIC_SOCKET_URL=http://localhost:4000`

## Deployment
Deploy Next.js to Vercel and the Socket.io server to Render or another WebSocket-compatible service. Set `NEXT_PUBLIC_SOCKET_URL` on Vercel and `FRONTEND_URL` on the socket server.

## Architecture
Patient Browser -> Socket.io -> Node.js Server -> Socket.io room -> Staff Browser.

The demo stores the current session in server memory. Production should add persistent storage, authentication, authorization and server-side validation.
