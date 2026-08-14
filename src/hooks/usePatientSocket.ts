"use client";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PatientData, PatientSession, SessionStatus } from "@/types/patient";

export function usePatientSocket(sessionId: string | null) {
  const [session, setSession] = useState<PatientSession | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const s = getSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onSnapshot = (x: PatientSession) => setSession(x);
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("patient:snapshot", onSnapshot);
    s.connect();
    s.emit("session:join", sessionId);
    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("patient:snapshot", onSnapshot);
    };
  }, [sessionId]);

  const updatePatient = (data: PatientData, status: SessionStatus, submittedAt: string | null) => {
    if (!sessionId) return;
    getSocket().emit("patient:update", { sessionId, data, status, submittedAt });
  };

  return { session, connected, updatePatient };
}
