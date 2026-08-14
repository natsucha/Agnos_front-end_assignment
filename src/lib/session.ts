const STORAGE_KEY = "agnos-patient-session-id";

export function getOrCreatePatientSessionId(): string {
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(STORAGE_KEY, id);
  return id;
}
