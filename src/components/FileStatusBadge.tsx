import { cn } from "@/lib/utils";

/**
 * Status pill — colored bg + matching text, rounded-full, uppercase mono.
 * Colors are derived from the status name so org-custom statuses still read
 * sensibly. Never uses blue. Color is always paired with the text label.
 */
function toneFor(name: string): string {
  const n = name.toLowerCase();
  if (/(approv|complet|done|finish|clos)/.test(n))
    return "bg-[#27AE60]/12 text-[#1E8449]";
  if (/(verif|confirm)/.test(n)) return "bg-[#0D9488]/12 text-[#0F766E]";
  if (/(review|progress|process|pending|transit|hold)/.test(n))
    return "bg-[#E67E22]/14 text-[#B45309]";
  if (/(dispatch|sent|archive)/.test(n)) return "bg-[#6B6560]/14 text-[#57534E]";
  if (/(receiv|new|open|creat|intake)/.test(n))
    return "bg-[#E7E2D6] text-[#57534E]";
  return "bg-[#EEE9DF] text-[#6B6560]";
}

export function FileStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-medium uppercase tracking-wide",
        toneFor(status),
        className,
      )}>
      {status}
    </span>
  );
}
