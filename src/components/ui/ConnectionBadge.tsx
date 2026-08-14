import { Wifi, Loader2 } from "lucide-react";
import type { ConnectionStatus } from "@/hooks/connectionStatus";

const config: Record<ConnectionStatus, { label: string; icon: React.ReactNode }> = {
  connecting: { label: "Connecting…", icon: <Loader2 size={14} className="animate-spin text-slate-400" /> },
  connected: { label: "Connected", icon: <Wifi size={14} className="text-emerald-600" /> },
  reconnecting: { label: "Reconnecting…", icon: <Loader2 size={14} className="animate-spin text-amber-500" /> }
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const { label, icon } = config[status];
  return (
    <div className="flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-xs font-medium shadow-sm ring-1 ring-slate-200">
      {icon}
      {label}
    </div>
  );
}
