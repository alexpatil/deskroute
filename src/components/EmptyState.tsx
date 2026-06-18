import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared empty state: serif heading + muted description + optional CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}>
      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-xl border border-[#E0DBD0] bg-[#F7F4EE] text-[#6B6560]">
          <Icon className="size-5" />
        </span>
      )}
      <h3 className="font-serif text-2xl text-[#1A1814]">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-[#6B6560]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
