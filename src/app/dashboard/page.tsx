"use client";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { FileNumberLabel } from "@/components/FileNumberLabel";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonRow } from "@/components/SkeletonRow";
import type { File } from "@/features/files/file.types";
import { formatFileNumber } from "@/features/files/file.utils";
import { httpService } from "@/lib/httpService";
import { Download, FileText, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 12;
const selectClass =
  "h-9 rounded-lg border border-[#E0DBD0] bg-white px-2.5 text-sm text-[#1A1814] outline-none focus-visible:border-[#C0392B] focus-visible:ring-2 focus-visible:ring-[#C0392B]/30";

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [office, setOffice] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    httpService
      .get<File[]>("/api/files")
      .then(setFiles)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statuses = useMemo(
    () => [...new Set(files.map((f) => f.currentStatus.name))].sort(),
    [files],
  );
  const offices = useMemo(
    () => [...new Set(files.map((f) => f.currentLocation.name))].sort(),
    [files],
  );
  const categories = useMemo(() => [...new Set(files.map((f) => f.category))].sort(), [files]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return files.filter((f) => {
      if (status !== "all" && f.currentStatus.name !== status) return false;
      if (office !== "all" && f.currentLocation.name !== office) return false;
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      return (
        f.subjectName.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        formatFileNumber(f).toLowerCase().includes(q) ||
        f.currentLocation.name.toLowerCase().includes(q) ||
        f.currentStatus.name.toLowerCase().includes(q)
      );
    });
  }, [files, search, status, office, category]);

  // Reset to first page whenever the filter set changes.
  useEffect(() => {
    setPage(1);
  }, [search, status, office, category]);

  const filtering =
    search.trim() !== "" || status !== "all" || office !== "all" || category !== "all";

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const rel = (d: Date) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const exportCsv = () => {
    const header = ["Number", "Subject", "Category", "Location", "Status", "Updated"];
    const rows = visible.map((f) => [
      formatFileNumber(f),
      f.subjectName,
      f.category,
      f.currentLocation.name,
      f.currentStatus.name,
      new Date(f.updatedAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "files.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Files">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-6">
        {/* Heading */}
        <div>
          <h1 className="font-serif text-3xl leading-none text-[#1A1814]">
            Files{" "}
            <span className="font-mono text-lg text-[#6B6560]">
              ({loading ? "—" : files.length})
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-[#6B6560]">
            {filtering && !loading
              ? `${visible.length} of ${files.length} files match`
              : "All files across your organization"}
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B6560]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search files"
              placeholder="Search by number, subject…"
              className="h-9 w-full rounded-lg border border-[#E0DBD0] bg-white pl-9 pr-3 text-sm text-[#1A1814] outline-none placeholder:text-[#6B6560] focus-visible:border-[#C0392B] focus-visible:ring-2 focus-visible:ring-[#C0392B]/30"
            />
          </div>

          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select aria-label="Filter by office" value={office} onChange={(e) => setOffice(e.target.value)} className={selectClass}>
            <option value="all">All offices</option>
            {offices.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={exportCsv}
            disabled={visible.length === 0}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-[#6B6560] transition-colors hover:bg-[#EEE9DF] hover:text-[#1A1814] disabled:pointer-events-none disabled:opacity-40">
            <Download className="size-4" />
            Export CSV
          </button>
        </div>

        {/* Table card */}
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E0DBD0] bg-white">
          {/* Desktop table */}
          <table className="hidden w-full table-fixed text-left text-sm md:table">
            <colgroup>
              <col className="w-20" />
              <col />
              <col className="w-40" />
              <col className="w-35" />
              <col className="w-30" />
              <col className="w-30" />
              <col className="w-35" />
            </colgroup>
            <thead>
              <tr className="text-xs uppercase tracking-wide text-[#6B6560]">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : pageRows.length === 0 ? null : (
                pageRows.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => router.push(`/files/${f.id}`)}
                    className="cursor-pointer border-t border-[#E0DBD0] transition-colors hover:bg-[#F7F4EE]">
                    <td className="px-4 py-3">
                      <FileNumberLabel file={f} className="text-sm text-[#6B6560]" />
                    </td>
                    <td className="truncate px-4 py-3 font-medium text-[#1A1814]">{f.subjectName}</td>
                    <td className="truncate px-4 py-3 text-[#6B6560]">{f.category}</td>
                    <td className="truncate px-4 py-3 text-[#6B6560]">{f.currentLocation.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={f.currentStatus.name} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#6B6560]">{rel(f.updatedAt)}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/files/${f.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-[#C0392B] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#a83324]">
                        Route →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="divide-y divide-[#E0DBD0] md:hidden">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-[#EEE9DF]" />
                ))}
              </div>
            ) : (
              pageRows.map((f) => (
                <Link key={f.id} href={`/files/${f.id}`} className="block px-4 py-3.5 active:bg-[#F7F4EE]">
                  <div className="flex items-center justify-between gap-2">
                    <FileNumberLabel file={f} className="text-sm text-[#6B6560]" />
                    <StatusBadge status={f.currentStatus.name} />
                  </div>
                  <p className="mt-1.5 font-medium text-[#1A1814]">{f.subjectName}</p>
                  <p className="mt-0.5 text-xs text-[#6B6560]">
                    {f.category} · {f.currentLocation.name} · {rel(f.updatedAt)}
                  </p>
                </Link>
              ))
            )}
          </div>

          {/* Empty state */}
          {!loading && visible.length === 0 && (
            <EmptyState
              icon={FileText}
              title={files.length === 0 ? "No files yet" : "No files match your filters"}
              description={
                files.length === 0
                  ? "Log your first file to start tracking."
                  : "Try adjusting your search or filters."
              }
              action={
                files.length === 0 ? (
                  <Link
                    href="/files/new"
                    className="inline-flex h-9 items-center rounded-md bg-[#C0392B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
                    Log a file
                  </Link>
                ) : undefined
              }
            />
          )}
        </div>

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="mt-5 flex items-center justify-center gap-1 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="rounded-md px-3 py-1.5 font-medium text-[#6B6560] transition-colors hover:bg-[#EEE9DF] disabled:pointer-events-none disabled:opacity-40">
              Prev
            </button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={
                  current === i + 1
                    ? "rounded-md bg-[#C0392B] px-3 py-1.5 font-semibold text-white"
                    : "rounded-md px-3 py-1.5 font-medium text-[#6B6560] transition-colors hover:bg-[#EEE9DF]"
                }>
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={current === pageCount}
              className="rounded-md px-3 py-1.5 font-medium text-[#6B6560] transition-colors hover:bg-[#EEE9DF] disabled:pointer-events-none disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
