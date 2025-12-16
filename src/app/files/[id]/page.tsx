// app/files/[id]/page.tsx
"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/Loading";
import type { FileWithHistory } from "@/features/files/file.types";
import { httpService } from "@/lib/httpService";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
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
      const updatedFile = await httpService.put<FileWithHistory>(`/api/files/${fileId}`, {
        currentLocationId: editLocationId,
        currentStatusId: editStatusId,
      });

      setFile(updatedFile);
      setUpdating(false);
      //await loadData();
    } catch (err) {
      //console.error("Failed to update file:", err);
      alert(err instanceof Error ? err.message : "Failed to update file");
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
      <div className='min-h-screen flex items-center justify-center' style={{ backgroundColor: "var(--color-background)" }}>
        <div style={{ color: "var(--color-text)" }}>{error}</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: "var(--color-background)" }}>
      <Header title='File Detail' showBack />

      <main className='max-w-3xl mx-auto px-4 py-4 pb-32 space-y-4'>
        <Card>
          <div className='flex justify-between items-start mb-4'>
            <div className='flex-1'>
              <h2 className='text-xl font-bold mb-1' style={{ color: "var(--color-text)" }}>
                {file.clientName}
              </h2>
              <p className='text-sm font-medium' style={{ color: "var(--color-textMuted)" }}>
                {file.serviceType}
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
                  className='block w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  style={
                    {
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                      "--tw-ring-color": "var(--color-primary)",
                    } as any
                  }>
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
                  className='block w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  style={
                    {
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                      "--tw-ring-color": "var(--color-primary)",
                    } as any
                  }>
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
              <div className='flex flex-col gap-3 pt-2'>
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
                  {file.currentLocation.name} ({file.currentLocation.type})
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
          <div
            className='fixed bottom-0  left-0 right-0 p-4 border-t'
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className='max-w-3xl mx-auto flex flex-col gap-3'>
              <Button onClick={() => setIsEditing(true)}>Update Location & Status</Button>
            </div>
          </div>
        )}

        {!isEditing && file.isCompleted && user?.isOwner && (
          <div
            className='fixed bottom-0 left-0 right-0 p-4 border-t'
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className='max-w-3xl mx-auto'>
              <Button onClick={() => setIsEditing(true)} variant='secondary'>
                Update Completed File (Owner Only)
              </Button>
            </div>
          </div>
        )}

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
    </div>
  );
}
