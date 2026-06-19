// app/files/[id]/page.tsx
"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { PageLoader } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import type { FileWithHistory } from "@/features/files/file.types";
import { formatFileNumber } from "@/features/files/file.utils";
import { httpService } from "@/lib/httpService";
import { cn } from "@/lib/utils";
import { ChevronDown, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface User {
  id: string;
  isOwner: boolean;
  assignedLocationId: string | null;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

interface FileStatus {
  id: string;
  name: string;
  isEnabled: boolean;
}

/** Styled select with a non-interactive chevron (item 5). */
function FieldSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-lg border border-[#E0DBD0] bg-white px-4 py-2.5 pr-10 text-sm text-[#1A1814] focus:border-[#C0392B] focus:outline-none focus:ring-1 focus:ring-[#C0392B] disabled:cursor-not-allowed disabled:opacity-50">
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown className="h-4 w-4 text-[#6B6560]" />
      </span>
    </div>
  );
}

export default function FileDetailPage() {
  const params = useParams();
  const fileId = params.id as string;
  const toast = useToast();

  const [file, setFile] = useState<FileWithHistory | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLocationId, setEditLocationId] = useState("");
  const [editStatusId, setEditStatusId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    loadData();
  }, [fileId]);

  const loadData = async () => {
    try {
      const [fileData, userData, locationsData, statusesData] = await Promise.all([
        httpService.get<FileWithHistory>(`/api/files/${fileId}`),
        httpService.get<User>("/api/auth/me"),
        httpService.get<Location[]>("/api/locations"),
        httpService.get<FileStatus[]>("/api/file-statuses?enabledOnly=true"),
      ]);
      setFile(fileData);
      setUser(userData);
      setLocations(locationsData);
      setStatuses(statusesData);
      setEditLocationId(fileData.currentLocationId);
      setEditStatusId(fileData.currentStatusId);
    } catch (err) {
      console.log("Failed to load file:", err instanceof Error ? err.message : err);
      setError(err instanceof Error ? err.message : "Failed to load file");
      // alert(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!file) return;

    const hasChanges = editLocationId !== file.currentLocationId || editStatusId !== file.currentStatusId;
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }
    setUpdating(true);
    try {
      await httpService.put<FileWithHistory>(`/api/files/${fileId}`, {
        currentLocationId: editLocationId,
        currentStatusId: editStatusId,
      });

      // Re-fetch so the current location/status AND the route history reflect
      // the hand-off we just recorded, instead of showing stale data.
      await loadData();
      setIsEditing(false);
      toast("File updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update file", "error");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!file) {
    return (
      <AppShell title="File Detail" backHref="/dashboard">
        <div className="flex items-center justify-center h-40">
          <p style={{ color: "var(--color-text)" }}>{error ?? "File not found"}</p>
        </div>
      </AppShell>
    );
  }

  const canEdit = !file.isCompleted || !!user?.isOwner;
  const cardClass = "rounded-xl border border-[#E0DBD0] bg-white p-5 sm:p-6";

  return (
    <AppShell title="File Detail" backHref="/dashboard">
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6 pb-10">
        {/* Details */}
        <section className={cardClass}>
          <p className="font-mono text-xs uppercase tracking-widest text-[#6B6560]">
            {formatFileNumber(file)}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-[#1A1814]">
            {file.subjectName}
          </h1>
          <p className="mt-1 text-sm text-[#6B6560]">{file.category}</p>

          <div className="my-5 border-t border-[#E0DBD0]" />

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1A1814]">Current location</label>
                <FieldSelect
                  value={editLocationId}
                  onChange={(e) => setEditLocationId(e.target.value)}
                  disabled={file.isCompleted && !user?.isOwner}>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </option>
                  ))}
                </FieldSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1A1814]">Current status</label>
                <FieldSelect
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(e.target.value)}
                  disabled={file.isCompleted && !user?.isOwner}>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </FieldSelect>
              </div>
              {file.isCompleted && !user?.isOwner && (
                <p className="rounded-lg border border-[#E0DBD0] bg-[#F7F4EE] p-3 text-sm text-[#6B6560]">
                  This file is completed. Only the organization owner can modify it.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditLocationId(file.currentLocationId);
                    setEditStatusId(file.currentStatusId);
                  }}
                  disabled={updating}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} loading={updating} disabled={updating || (file.isCompleted && !user?.isOwner)}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6B6560]">Location</p>
                  <p className="mt-1.5 text-sm font-medium text-[#1A1814]">
                    {file.currentLocation.name}
                    {file.currentLocation.type !== "Branch" && (
                      <span className="text-[#6B6560]"> ({file.currentLocation.type})</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6B6560]">Status</p>
                  <div className="mt-1.5">
                    <StatusBadge status={file.currentStatus.name} />
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="mt-6 flex justify-end">
                  <Button
                    variant={file.isCompleted ? "secondary" : "primary"}
                    onClick={() => setIsEditing(true)}>
                    {file.isCompleted ? "Update completed file" : "Update location & status"}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* QR receipt */}
        <section className={cardClass}>
          <div className="flex items-center gap-4">
            <div className="shrink-0 rounded-lg border border-[#E0DBD0] p-1.5">
              <QRCode value={origin ? `${origin}/files/${file.id}` : ""} size={72} bgColor="#ffffff" fgColor="#1A1814" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1A1814]">Scan to track</p>
              <p className="mt-0.5 text-xs text-[#6B6560]">
                Anyone can scan this to see the file&apos;s live status.
              </p>
            </div>
            <Link
              href={`/files/${file.id}/receipt`}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-[#C0392B] px-3 text-sm font-semibold text-[#C0392B] transition-colors hover:bg-[#C0392B] hover:text-white">
              <Printer className="size-4" />
              <span className="hidden sm:inline">Print</span>
            </Link>
          </div>
        </section>

        {/* Route history */}
        <section className={cardClass}>
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-[#6B6560]">
            Route history
          </h2>
          {file.history.length === 0 ? (
            <p className="py-4 text-center text-sm text-[#6B6560]">No history yet</p>
          ) : (
            <div>
              {file.history.map((entry, i) => {
                const isLast = i === file.history.length - 1;
                const isOrigin = isLast; // oldest entry = the file's origin
                let label: string;
                let secondary: string;
                if (entry.locationChanged && entry.statusChanged) {
                  label = `Moved to ${entry.toLocation.name}`;
                  secondary = `Status: ${entry.oldStatusName} → ${entry.newStatusName}`;
                } else if (entry.locationChanged) {
                  label = `Moved to ${entry.toLocation.name}`;
                  secondary = entry.fromLocation ? `From ${entry.fromLocation.name}` : entry.toLocation.name;
                } else if (entry.statusChanged) {
                  label = "Status changed";
                  secondary = `${entry.oldStatusName} → ${entry.newStatusName}`;
                } else {
                  label = "File created";
                  secondary = entry.toLocation.name;
                }
                return (
                  <div key={entry.id} className="relative pb-5 pl-8 last:pb-0">
                    {!isLast && (
                      <span className="absolute bottom-0 left-[11px] top-6 w-px bg-[#E0DBD0]" />
                    )}
                    <span
                      className={cn(
                        "absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white",
                        isOrigin ? "border-[#E0DBD0]" : "border-[#C0392B]",
                      )}>
                      {!isOrigin && <span className="h-2 w-2 rounded-full bg-[#C0392B]" />}
                    </span>
                    <p className="text-sm font-medium text-[#1A1814]">{label}</p>
                    <p className="mt-0.5 text-xs text-[#6B6560]">{secondary}</p>
                    <p className="mt-1 text-xs text-[#6B6560]">{formatDate(entry.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
