"use client";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PatientSession } from "@/types/patient";
import type { ConnectionStatus } from "./connectionStatus";

export function useStaffSocket() {
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const hasConnectedOnce = useRef(false);

  useEffect(() => {
    const s = getSocket();
    // Re-joins on every "connect", including reconnects, so a dropped connection
    // doesn't leave this dashboard silently out of the "staff" broadcast room.
    const onConnect = () => {
      hasConnectedOnce.current = true;
      setConnectionStatus("connected");
      s.emit("staff:join");
    };
    const onDisconnect = () => setConnectionStatus(hasConnectedOnce.current ? "reconnecting" : "connecting");
    const onSnapshot = (list: PatientSession[]) => setSessions(list);
    const onUpdate = (updated: PatientSession) =>
      setSessions((prev) => {
        const index = prev.findIndex((x) => x.id === updated.id);
        if (index === -1) return [...prev, updated];
        const next = [...prev];
        next[index] = updated;
        return next;
      });

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("sessions:snapshot", onSnapshot);
    s.on("session:update", onUpdate);
    if (s.connected) onConnect();
    else s.connect();

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("sessions:snapshot", onSnapshot);
      s.off("session:update", onUpdate);
    };
  }, []);

  return { sessions, connectionStatus };
}
