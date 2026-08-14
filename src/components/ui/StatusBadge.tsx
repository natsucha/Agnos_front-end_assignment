import { SessionStatus } from "@/types/patient";

const config: Record<SessionStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  inactive: { label: "Inactive", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  submitted: { label: "Submitted", className: "bg-blue-50 text-blue-700 ring-blue-200" }
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  const item = config[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${item.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}