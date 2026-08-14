"use client";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PatientSession } from "@/types/patient";

export function useStaffSocket() {
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
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
    s.connect();
    s.emit("staff:join");

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("sessions:snapshot", onSnapshot);
      s.off("session:update", onUpdate);
    };
  }, []);

  return { sessions, connected };
}
