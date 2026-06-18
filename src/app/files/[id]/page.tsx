// app/files/[id]/page.tsx
"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageLoader } from "@/components/Loading";
import { useToast } from "@/components/Toast";
import type { FileWithHistory } from "@/features/files/file.types";
import { formatFileNumber } from "@/features/files/file.utils";
import { httpService } from "@/lib/httpService";
import { Printer } from "lucide-react";
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

  return (
    <AppShell title="File Detail" backHref="/dashboard">
      <main className='max-w-3xl mx-auto px-4 py-6 pb-10 space-y-4'>
        <Card>
          <div className='flex justify-between items-start mb-4'>
            <div className='flex-1'>
              <p className='text-xs font-mono mb-1' style={{ color: "var(--color-textMuted)" }}>
                {formatFileNumber(file)}
              </p>
              <h2 className='text-xl font-bold mb-1' style={{ color: "var(--color-text)" }}>
                {file.subjectName}
              </h2>
              <p className='text-sm font-medium' style={{ color: "var(--color-textMuted)" }}>
                {file.category}
              </p>
            </div>
            <span
              className='px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ml-2'
              style={{
                backgroundColor: file.isCompleted ? "var(--color-successLight)" : "var(--color-warningLight)",
                color: file.isCompleted ? "var(--color-success)" : "var(--color-warning)",
              }}>
              {file.isCompleted ? "Completed" : "Active"}
            </span>
          </div>

          {isEditing ? (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                  Current Location
                </label>
                <select
                  value={editLocationId}
                  onChange={(e) => setEditLocationId(e.target.value)}
                  disabled={file.isCompleted && !user?.isOwner}
                  className='field field-lg field-select disabled:opacity-50 disabled:cursor-not-allowed'>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                  Current Status
                </label>
                <select
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(e.target.value)}
                  disabled={file.isCompleted && !user?.isOwner}
                  className='field field-lg field-select disabled:opacity-50 disabled:cursor-not-allowed'>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              {file.isCompleted && !user?.isOwner && (
                <div
                  className='rounded-xl border-2 p-3 text-sm font-semibold'
                  style={{ backgroundColor: "var(--color-warningLight)", borderColor: "var(--color-warning)", color: "var(--color-warning)" }}>
                  This file is completed. Only the organization owner can modify it.
                </div>
              )}
              <div className='flex gap-2 pt-2'>
                <Button onClick={handleUpdate} loading={updating} disabled={updating || (file.isCompleted && !user?.isOwner)}>
                  Save Changes
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setIsEditing(false);
                    setEditLocationId(file.currentLocationId);
                    setEditStatusId(file.currentStatusId);
                  }}
                  disabled={updating}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='rounded-xl p-3 border' style={{ backgroundColor: "var(--color-backgroundAlt)", borderColor: "var(--color-border)" }}>
                <p className='text-xs font-semibold uppercase tracking-wide mb-1' style={{ color: "var(--color-textMuted)" }}>
                  Current Location
                </p>
                <p className='text-base font-semibold' style={{ color: "var(--color-text)" }}>
                  {file.currentLocation.name}
                  {file.currentLocation.type !== "Branch" && (
                    <span className='ml-2 text-sm font-normal' style={{ color: "var(--color-textMuted)" }}>
                      ({file.currentLocation.type})
                    </span>
                  )}
                </p>
              </div>
              <div className='rounded-xl p-3 border' style={{ backgroundColor: "var(--color-backgroundAlt)", borderColor: "var(--color-border)" }}>
                <p className='text-xs font-semibold uppercase tracking-wide mb-1' style={{ color: "var(--color-textMuted)" }}>
                  Current Status
                </p>
                <p className='text-base font-semibold' style={{ color: "var(--color-text)" }}>
                  {file.currentStatus.name}
                </p>
              </div>
            </div>
          )}
        </Card>

        {!isEditing && !file.isCompleted && (
          <div className='flex justify-end'>
            <Button onClick={() => setIsEditing(true)}>Update Location & Status</Button>
          </div>
        )}

        {!isEditing && file.isCompleted && user?.isOwner && (
          <div className='flex justify-end'>
            <Button onClick={() => setIsEditing(true)} variant='secondary'>
              Update Completed File (Owner Only)
            </Button>
          </div>
        )}

        {/* QR Receipt — available for any file, any time */}
        <div className="rounded-xl border border-[#E0DBD0] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="shrink-0 rounded-lg border border-[#E0DBD0] bg-white p-2">
              <QRCode value={origin ? `${origin}/files/${file.id}` : ""} size={84} bgColor="#ffffff" fgColor="#1A1814" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-lg tracking-wider text-[#1A1814]">{formatFileNumber(file)}</p>
              <p className="mt-0.5 text-xs text-[#6B6560]">
                Anyone can scan this to see the file&apos;s live status.
              </p>
            </div>
          </div>
          <Link
            href={`/files/${file.id}/receipt`}
            className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#C0392B] text-sm font-semibold text-[#C0392B] transition-colors hover:bg-[#C0392B] hover:text-white">
            <Printer className="size-4" />
            Print receipt
          </Link>
        </div>

        <Card>
          <h3 className='text-lg font-bold mb-4' style={{ color: "var(--color-text)" }}>
            History
          </h3>
          <div className='space-y-4'>
            {file.history.length === 0 ? (
              <p className='text-center py-4 text-sm' style={{ color: "var(--color-textMuted)" }}>
                No history available
              </p>
            ) : (
              file.history.map((entry) => (
                <div key={entry.id} className='flex gap-3 pb-4 border-b last:border-b-0' style={{ borderColor: "var(--color-borderLight)" }}>
                  <div className='shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full' style={{ backgroundColor: "var(--color-primary)" }} />
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex-1'>
                        {entry.locationChanged && entry.statusChanged ? (
                          <>
                            <p className='font-semibold text-sm mb-1' style={{ color: "var(--color-text)" }}>
                              Moved: {entry.fromLocation?.name} → {entry.toLocation.name}
                            </p>
                            <p className='text-sm' style={{ color: "var(--color-textMuted)" }}>
                              Status: {entry.oldStatusName} → {entry.newStatusName}
                            </p>
                          </>
                        ) : entry.locationChanged ? (
                          <p className='font-semibold text-sm' style={{ color: "var(--color-text)" }}>
                            Moved: {entry.fromLocation?.name} → {entry.toLocation.name}
                          </p>
                        ) : entry.statusChanged ? (
                          <p className='font-semibold text-sm' style={{ color: "var(--color-text)" }}>
                            Status changed: {entry.oldStatusName} → {entry.newStatusName}
                          </p>
                        ) : (
                          <p className='text-sm' style={{ color: "var(--color-textMuted)" }}>
                            Updated at {entry.toLocation.name}
                          </p>
                        )}
                      </div>
                      <p
                        className='text-xs font-medium px-2 py-1 rounded-lg self-start'
                        style={{ backgroundColor: "var(--color-backgroundAlt)", color: "var(--color-textMuted)" }}>
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </AppShell>
  );
}
