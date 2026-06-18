import { formatFileNumber } from "@/features/files/file.utils";
import type { File } from "@/features/files/file.types";
import { cn } from "@/lib/utils";

/**
 * The file's short, hand-writeable number rendered like a stamped office code:
 * large mono, dark ink, wide tracking.
 */
export function FileNumberLabel({
  file,
  className,
}: {
  file: Pick<File, "fileNumber" | "trackingNumber">;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tracking-wider text-[#1A1814]", className)}>
      {formatFileNumber(file)}
    </span>
  );
}
