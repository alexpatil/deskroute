"use client";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { File } from "@/features/files/file.types";
import { formatFileNumber, matchesFileNumber } from "@/features/files/file.utils";
import { httpService } from "@/lib/httpService";
import { CheckCircle2, FileText, Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Filter = "all" | "active" | "completed";

export default function DashboardPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Load the full set once; counts and tab filtering are derived client-side
      // so every tab's count stays accurate regardless of the active tab.
      const data = await httpService.get<File[]>("/api/files");
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const total = files.length;
  const active = files.filter((f) => !f.isCompleted).length;
  const completed = files.filter((f) => f.isCompleted).length;

  const visible = files.filter((f) => {
    // Tab filter
    if (filter === "active" && f.isCompleted) return false;
    if (filter === "completed" && !f.isCompleted) return false;
    // Search filter
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      matchesFileNumber(f, search) ||
      f.subjectName.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.currentStatus.name.toLowerCase().includes(q) ||
      f.currentLocation.name.toLowerCase().includes(q)
    );
  });

  const rel = (d: Date) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const STATS: { key: Filter; label: string; count: number; icon: typeof FileText; tint: string }[] = [
    { key: "all", label: "Total Files", count: total, icon: FileText, tint: "text-foreground" },
    { key: "active", label: "Active", count: active, icon: Loader2, tint: "text-warning" },
    { key: "completed", label: "Completed", count: completed, icon: CheckCircle2, tint: "text-success" },
  ];

  return (
    <AppShell
      title="Files"
      actions={
        <Button size="sm" onClick={() => router.push("/files/new")}>
          <Plus className="size-4" />
          New file
        </Button>
      }>
      <div className="mx-auto max-w-5xl animate-fade-in space-y-6 px-6 py-6">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map(({ key, label, count, icon: Icon, tint }) => {
            const isActive = filter === key;
            return (
              <Card
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => setFilter(key)}
                onKeyDown={(e) => e.key === "Enter" && setFilter(key)}
                className={cn(
                  "cursor-pointer gap-2 p-4 transition-all hover:ring-foreground/20",
                  isActive && "ring-2 ring-primary"
                )}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <Icon className={cn("size-4", tint)} />
                </div>
                <span className="text-2xl font-bold tabular-nums leading-none">
                  {loading ? "—" : count}
                </span>
              </Card>
            );
          })}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file no., subject…"
              className="h-9 pl-9"
            />
          </div>

          <div className="inline-flex items-center gap-0.5 rounded-lg border bg-muted p-0.5">
            {STATS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "h-7 rounded-md px-3 text-xs font-medium transition-all",
                  filter === key
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                {label.replace("Total Files", "All")}
              </button>
            ))}
          </div>

          {search && (
            <span className="text-xs text-muted-foreground">
              {visible.length} result{visible.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Files table ── */}
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Subject</TableHead>
                <TableHead className="w-32">Office</TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
                <TableHead className="w-20 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="mt-1.5 h-3 w-24" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="mx-auto h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-3 w-10" /></TableCell>
                  </TableRow>
                ))
              ) : visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center justify-center gap-2 py-14">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                        <FileText className="size-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        {search ? "No files match your search" : "No files yet"}
                      </p>
                      {!search && (
                        <Button size="sm" className="mt-1" onClick={() => router.push("/files/new")}>
                          <Plus className="size-4" />
                          Create first file
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((file) => (
                  <TableRow
                    key={file.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/files/${file.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            file.isCompleted ? "bg-success" : "bg-warning"
                          )}
                        />
                        <span className="truncate font-medium">{file.subjectName}</span>
                      </div>
                      <p className="mt-0.5 truncate pl-3.5 text-xs text-muted-foreground">
                        <span className="font-mono text-foreground/70">{formatFileNumber(file)}</span>
                        {" · "}
                        {file.category}
                      </p>
                    </TableCell>
                    <TableCell className="truncate text-xs text-muted-foreground">
                      {file.currentLocation.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-medium",
                          file.isCompleted
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        )}>
                        {file.currentStatus.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                      {rel(file.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {!loading && visible.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            {visible.length} file{visible.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </p>
        )}
      </div>
    </AppShell>
  );
}
