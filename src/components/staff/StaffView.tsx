"use client";

import { useEffect, useState } from "react";
import { Clock3, Activity, Users } from "lucide-react";
import { useStaffSocket } from "@/hooks/useStaffSocket";
import { PatientData, PatientSession, SessionStatus, emptyPatient } from "@/types/patient";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";

const displayFields: Array<[keyof PatientData, string]> = [
  ["firstName", "First Name"],
  ["middleName", "Middle Name"],
  ["lastName", "Last Name"],
  ["dateOfBirth", "Date of Birth"],
  ["gender", "Gender"],
  ["phoneNumber", "Phone Number"],
  ["email", "Email"],
  ["address", "Address"],
  ["preferredLanguage", "Preferred Language"],
  ["nationality", "Nationality"],
  ["emergencyContactName", "Emergency Contact"],
  ["emergencyContactRelationship", "Emergency Relationship"],
  ["religion", "Religion"]
];

function deriveStatus(session: PatientSession, now: number): SessionStatus {
  if (session.status === "submitted") return "submitted";
  const elapsed = now - new Date(session.last_activity).getTime();
  return elapsed <= 30000 ? "active" : "inactive";
}

function patientName(data: PatientData) {
  return [data.firstName, data.lastName].filter(Boolean).join(" ") || "Unnamed patient";
}

export default function StaffView() {
  const { sessions, connectionStatus } = useStaffSocket();
  const [now, setNow] = useState(Date.now());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedId && sessions.some((s) => s.id === selectedId)) return;
    setSelectedId(sessions[0]?.id ?? null);
  }, [selectedId, sessions]);

  const selected = sessions.find((s) => s.id === selectedId) ?? null;
  const data = selected?.data ?? emptyPatient;

  const counts = sessions.reduce(
    (acc, s) => {
      acc[deriveStatus(s, now)]++;
      return acc;
    },
    { active: 0, inactive: 0, submitted: 0 }
  );

  const summary: Array<{ label: string; value: number }> = [
    { label: "Total", value: sessions.length },
    { label: "Active", value: counts.active },
    { label: "Inactive", value: counts.inactive },
    { label: "Submitted", value: counts.submitted }
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Agnos • Staff</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Patient Monitoring</h1>
            <p className="mt-1 text-sm text-slate-500">
              {sessions.length} patient session{sessions.length === 1 ? "" : "s"} updating in real time.
            </p>
          </div>
          <ConnectionBadge status={connectionStatus} />
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 p-4">
              <Users size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Sessions</h2>
            </div>
            <div className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {sessions.length === 0 && (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <Users size={28} className="text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">Waiting for patient session</p>
                  <p className="text-xs text-slate-400">New patients will appear here as soon as they start filling out the form.</p>
                </div>
              )}
              {sessions.map((s) => {
                const status = deriveStatus(s, now);
                const secondsAgo = Math.max(0, Math.floor((now - new Date(s.last_activity).getTime()) / 1000));
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`flex w-full flex-col gap-2 p-4 text-left transition hover:bg-slate-50 ${
                      s.id === selectedId ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-900">{patientName(s.data)}</span>
                    <span className="flex items-center justify-between">
                      <StatusBadge status={status} />
                      <span className="text-xs text-slate-400">{secondsAgo}s ago</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {!selected ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 p-10 text-center">
                <Activity size={28} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  {sessions.length === 0 ? "No active patient sessions yet" : "Select a patient session to view details"}
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 p-5 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity size={18} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-slate-900">{patientName(data)}</h2>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">Session: {selected.id}</p>
                    </div>
                    <StatusBadge status={deriveStatus(selected, now)} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">Activity</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {deriveStatus(selected, now) === "active"
                          ? "Patient is currently filling the form"
                          : deriveStatus(selected, now) === "submitted"
                            ? "Patient has submitted the form"
                            : "Patient is inactive"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">Last activity</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <Clock3 size={15} />
                        {Math.max(0, Math.floor((now - new Date(selected.last_activity).getTime()) / 1000))}s ago
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
                  {displayFields.map(([key, label]) => (
                    <div key={key} className="bg-white p-5">
                      <p className="text-xs font-medium text-slate-500">{label}</p>
                      <p className="mt-1 min-h-5 break-words text-sm font-semibold text-slate-900">{String(data[key] || "—")}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
