"use client";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PatientData, PatientSession, SessionStatus } from "@/types/patient";
import type { ConnectionStatus } from "./connectionStatus";

export function usePatientSocket(sessionId: string | null) {
  const [session, setSession] = useState<PatientSession | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const hasConnectedOnce = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    const s = getSocket();
    // Re-joins on every "connect", including reconnects after a dropped connection.
    const onConnect = () => {
      hasConnectedOnce.current = true;
      setConnectionStatus("connected");
      s.emit("session:join", sessionId);
    };
    const onDisconnect = () => setConnectionStatus(hasConnectedOnce.current ? "reconnecting" : "connecting");
    const onSnapshot = (x: PatientSession) => setSession(x);
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("patient:snapshot", onSnapshot);
    if (s.connected) onConnect();
    else s.connect();
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

  return { session, connectionStatus, updatePatient };
}
