import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || true, methods: ["GET", "POST"] } });

type Session = {
  id: string;
  data: Record<string, string>;
  status: "active" | "inactive" | "submitted";
  last_activity: string;
  submitted_at: string | null;
  updated_at: string;
};

const sessions = new Map<string, Session>();

app.get("/health", (_req, res) => res.json({ status: "ok" }));

io.on("connection", (socket) => {
  socket.on("session:join", (id: string) => {
    socket.join(id);
    const x = sessions.get(id);
    if (x) socket.emit("patient:snapshot", x);
  });

  socket.on("staff:join", () => {
    socket.join("staff");
    socket.emit("sessions:snapshot", Array.from(sessions.values()));
  });

  socket.on("patient:update", (p: any) => {
    if (!p?.sessionId || !p?.data) return;
    const now = new Date().toISOString();
    const x: Session = {
      id: p.sessionId,
      data: p.data,
      status: p.status,
      last_activity: now,
      submitted_at: p.submittedAt ?? null,
      updated_at: now
    };
    sessions.set(p.sessionId, x);
    io.to(p.sessionId).emit("patient:snapshot", x);
    io.to("staff").emit("session:update", x);
  });
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => console.log(`Socket.io server listening on :${port}`));
