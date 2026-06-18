// app/files/new/page.tsx
"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageLoader } from "@/components/Loading";
import type { File } from "@/features/files/file.types";
import { formatFileNumber } from "@/features/files/file.utils";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface Location {
  id: string;
  name: string;
  type: string;
}

interface User {
  id: string;
  isOwner: boolean;
  assignedLocationId: string | null;
}

interface FileStatus {
  id: string;
  name: string;
  isEnabled: boolean;
}

export default function NewFilePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [category, setCategory] = useState("");
  const [currentLocationId, setCurrentLocationId] = useState("");
  const [currentStatusId, setCurrentStatusId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [createdFile, setCreatedFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, locationsData, statusesData] = await Promise.all([
        httpService.get<User>("/api/auth/me"),
        httpService.get<Location[]>("/api/locations"),
        httpService.get<FileStatus[]>("/api/file-statuses?enabledOnly=true"),
      ]);

      setUser(userData);
      setStatuses(statusesData);
      setLocations(locationsData);

      if (locationsData.length > 0) {
        if (!userData.isOwner && userData.assignedLocationId) {
          setCurrentLocationId(userData.assignedLocationId);
        } else {
          setCurrentLocationId(locationsData[0].id);
        }
      }
      if (statusesData.length > 0) {
        setCurrentStatusId(statusesData[0].id);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load form data");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const file = await httpService.post<File>("/api/files", {
        subjectName,
        category,
        currentLocationId,
        currentStatusId,
      });
      setCreatedFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create file");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <PageLoader />;

  if (createdFile) {
    return <ReceiptView file={createdFile} onCreateAnother={() => {
      setCreatedFile(null);
      setSubjectName("");
      setCategory("");
    }} />;
  }

  const canSubmit = !loading && locations.length > 0 && statuses.length > 0 && subjectName.trim() && category.trim();

  return (
    <AppShell title="New File" backHref="/dashboard">
      <main className="max-w-3xl mx-auto px-4 py-6 pb-10">
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
              Create New File
            </h2>
            <p className="text-sm" style={{ color: "var(--color-textMuted)" }}>
              Fill in the details below
            </p>
          </div>

          <div className="space-y-5">
            {error && (
              <div
                className="rounded-xl border-2 p-4 text-sm font-semibold"
                style={{
                  backgroundColor: "var(--color-dangerLight)",
                  borderColor: "var(--color-danger)",
                  color: "var(--color-danger)",
                }}>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="subjectName"
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--color-text)" }}>
                Subject Name
              </label>
              <input
                id="subjectName"
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter the subject or case name"
                className="field field-lg"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--color-text)" }}>
                Category
              </label>
              <input
                id="category"
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Medical Records, Student Admission, Property Transfer"
                className="field field-lg"
              />
            </div>

            <div>
              <label
                htmlFor="currentLocationId"
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--color-text)" }}>
                Current Branch
              </label>
              <select
                id="currentLocationId"
                required
                value={currentLocationId}
                onChange={(e) => setCurrentLocationId(e.target.value)}
                className="field field-lg field-select">
                {locations.length === 0 ? (
                  <option value="">No branches available</option>
                ) : (
                  locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))
                )}
              </select>
              {locations.length === 0 && (
                <p
                  className="mt-2 text-sm font-semibold rounded-lg p-2 border"
                  style={{
                    backgroundColor: "var(--color-dangerLight)",
                    borderColor: "var(--color-danger)",
                    color: "var(--color-danger)",
                  }}>
                  Please create at least one branch first
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="currentStatusId"
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--color-text)" }}>
                Current Status
              </label>
              <select
                id="currentStatusId"
                required
                value={currentStatusId}
                onChange={(e) => setCurrentStatusId(e.target.value)}
                className="field field-lg field-select">
                {statuses.length === 0 ? (
                  <option value="">No statuses available</option>
                ) : (
                  statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))
                )}
              </select>
              {statuses.length === 0 && (
                <p
                  className="mt-2 text-sm font-semibold rounded-lg p-2 border"
                  style={{
                    backgroundColor: "var(--color-dangerLight)",
                    borderColor: "var(--color-danger)",
                    color: "var(--color-danger)",
                  }}>
                  Please create at least one status first
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => router.push("/dashboard")} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => handleSubmit()} disabled={!canSubmit} loading={loading}>
            Create File
          </Button>
        </div>
      </main>
    </AppShell>
  );
}

/* ── Receipt view shown after successful creation ─────────────────────────── */

function ReceiptView({
  file,
  onCreateAnother,
}: {
  file: File;
  onCreateAnother: () => void;
}) {
  const router = useRouter();
  const shortCode = formatFileNumber(file);
  const qrValue = `${typeof window !== "undefined" ? window.location.origin : ""}/files/${file.id}`;
  const createdAt = new Date(file.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* ── Screen view (hidden when printing) ─────────────────────────── */}
      <div className="print:hidden">
        <AppShell title="File Created">
        <main className="max-w-lg mx-auto px-4 py-6 pb-4 space-y-4">
          {/* Success banner */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{ backgroundColor: "var(--color-successLight)" }}>
            <div
              className="mx-auto mb-3 flex items-center justify-center w-14 h-14 rounded-full"
              style={{ backgroundColor: "var(--color-success)" }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--color-success)" }}>
              File Created
            </h2>
            <p className="text-sm font-medium" style={{ color: "var(--color-success)" }}>
              Tracking number assigned
            </p>
          </div>

          {/* Receipt card */}
          <Card>
            <div className="flex gap-4 items-start">
              {/* Details */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                    style={{ color: "var(--color-textMuted)" }}>
                    File No.
                  </p>
                  <p className="text-2xl font-black font-mono tracking-wider"
                    style={{ color: "var(--color-primary)" }}>
                    {shortCode}
                  </p>
                </div>

                <div className="space-y-1.5 text-sm">
                  <Row label="Subject" value={file.subjectName} />
                  <Row label="Category" value={file.category} />
                  <Row label="Branch" value={file.currentLocation.name} />
                  <Row label="Status" value={file.currentStatus.name} />
                  <Row label="Created" value={createdAt} />
                </div>
              </div>

              {/* QR Code */}
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div
                  className="p-2 rounded-xl border"
                  style={{ backgroundColor: "#fff", borderColor: "var(--color-border)" }}>
                  <QRCode value={qrValue} size={100} />
                </div>
                <p className="text-[10px] font-medium text-center"
                  style={{ color: "var(--color-textMuted)" }}>
                  Scan to open file
                </p>
              </div>
            </div>
          </Card>
        </main>

        {/* Bottom actions */}
        <div className="max-w-lg mx-auto px-4 pb-10">
          <div className="space-y-2">
            <Button onClick={() => window.print()} fullWidth>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => router.push(`/files/${file.id}`)}>
                View File
              </Button>
              <Button variant="secondary" size="sm" onClick={onCreateAnother}>
                New File
              </Button>
              <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
        </AppShell>
      </div>

      {/* ── Print receipt (only visible when printing) ──────────────────── */}
      <div className="hidden print:block">
        <PrintReceipt file={file} shortCode={shortCode} qrValue={qrValue} createdAt={createdAt} />
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 font-semibold w-16" style={{ color: "var(--color-textMuted)" }}>
        {label}
      </span>
      <span className="font-medium truncate" style={{ color: "var(--color-text)" }}>
        {value}
      </span>
    </div>
  );
}

function PrintReceipt({
  file,
  shortCode,
  qrValue,
  createdAt,
}: {
  file: File;
  shortCode: string;
  qrValue: string;
  createdAt: string;
}) {
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        color: "#1A1814",
        maxWidth: "360px",
        margin: "24px auto",
        padding: "24px",
        border: "2px dashed #9A948A",
        borderRadius: "12px",
      }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E0DBD0",
          paddingBottom: "12px",
          marginBottom: "16px",
        }}>
        <span style={{ fontSize: "17px", fontWeight: 700 }}>DeskRoute</span>
        <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B6560" }}>
          File Receipt
        </span>
      </div>

      {/* File number + QR — vertically centered */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6560" }}>
            File No.
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "30px", fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.06em" }}>
            {shortCode}
          </p>
        </div>
        <div style={{ padding: "6px", border: "1px solid #E0DBD0", borderRadius: "8px", background: "#fff" }}>
          <QRCode value={qrValue} size={92} />
        </div>
      </div>

      {/* Details */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <tbody>
          {[
            ["Subject", file.subjectName],
            ["Category", file.category],
            ["Office", file.currentLocation.name],
            ["Status", file.currentStatus.name],
            ["Created", createdAt],
          ].map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: "5px 0", fontWeight: 600, color: "#6B6560", width: "84px", verticalAlign: "top" }}>
                {label}
              </td>
              <td style={{ padding: "5px 0", fontWeight: 500 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #E0DBD0", marginTop: "16px", paddingTop: "12px", textAlign: "center" }}>
        <p style={{ fontSize: "10px", color: "#9A948A", margin: 0 }}>
          Scan to view live file status at deskroute.vercel.app
        </p>
      </div>
    </div>
  );
}
