import { cn } from "@/lib/utils";

type Variant = "pending" | "active" | "complete" | "archived";

const VARIANTS: Record<Variant, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-green-100 text-green-800 border-green-200",
  complete: "bg-blue-100 text-blue-800 border-blue-200",
  archived: "bg-[#EEE9DF] text-[#6B6560] border-[#E0DBD0]",
};

// Map an org's free-text status name onto one of the four visual variants.
function variantFor(status: string): Variant {
  const n = status.toLowerCase();
  if (/(complet|approv|done|finish|verif|dispatch)/.test(n)) return "complete";
  if (/(archiv|clos|cancel|reject)/.test(n)) return "archived";
  if (/(pending|new|open|receiv|await|hold|intake|draft)/.test(n)) return "pending";
  return "active";
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variantFor(status)],
        className,
      )}>
      {status}
    </span>
  );
}
