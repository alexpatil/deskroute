import type { File } from "./file.types";

/**
 * A short, hand-writeable label for a file. Prefers the per-organization
 * sequential number (e.g. "#0042"); for legacy files created before file
 * numbers existed, falls back to a slice of the tracking id.
 */
export function formatFileNumber(file: Pick<File, "fileNumber" | "trackingNumber">): string {
  if (file.fileNumber != null) {
    return `#${String(file.fileNumber).padStart(4, "0")}`;
  }
  return `#${file.trackingNumber.slice(-6).toUpperCase()}`;
}

/** Does a search query match this file's number? Matches "42", "0042", "#42". */
export function matchesFileNumber(
  file: Pick<File, "fileNumber" | "trackingNumber">,
  query: string,
): boolean {
  const q = query.trim().replace(/^#/, "").toLowerCase();
  if (!q) return false;
  if (file.fileNumber != null) {
    const n = String(file.fileNumber);
    return n === q || n.padStart(4, "0") === q || n.includes(q);
  }
  return file.trackingNumber.toLowerCase().includes(q);
}
