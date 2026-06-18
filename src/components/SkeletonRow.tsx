import { cn } from "@/lib/utils";

/** A shimmering placeholder table row, for loading states in DataTable. */
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-t border-[#E0DBD0]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className={cn(
              "h-3.5 animate-pulse rounded bg-[#EEE9DF]",
              i === 0 ? "w-3/4" : "w-1/2",
            )}
          />
        </td>
      ))}
    </tr>
  );
}

/** A standalone shimmering bar for card/skeleton layouts. */
export function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("h-4 animate-pulse rounded bg-[#EEE9DF]", className)} />;
}
