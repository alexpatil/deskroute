import { FileStatusBadge } from "@/components/FileStatusBadge";
import type { FileHistory } from "@/features/files/file.types";
import { cn } from "@/lib/utils";

function formatStamp(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Vertical route history: a ruled line with a dot per hand-off. The most recent
 * entry (index 0) gets a red dot; earlier entries are muted gray.
 */
export function RouteTimeline({ entries }: { entries: FileHistory[] }) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-[#6B6560]">No route history yet.</p>;
  }

  return (
    <ol className="relative">
      {entries.map((entry, i) => {
        const active = i === 0;
        const last = i === entries.length - 1;
        const status = entry.newStatusName ?? entry.status.name;
        return (
          <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span className="absolute left-[5px] top-3 h-full w-px bg-[#E0DBD0]" aria-hidden />
            )}
            <span
              className={cn(
                "z-10 mt-1 size-2.5 shrink-0 rounded-full ring-4 ring-white",
                active ? "bg-[#C0392B]" : "bg-[#B7B0A4]",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-[#1A1814]">
                  {entry.fromLocation
                    ? `${entry.fromLocation.name} → ${entry.toLocation.name}`
                    : entry.toLocation.name}
                </span>
                <FileStatusBadge status={status} />
              </div>
              <p className="mt-1 font-mono text-xs tracking-wide text-[#6B6560]">
                {formatStamp(entry.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
