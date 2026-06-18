"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageLoader } from "@/components/Loading";
import { useToast } from "@/components/Toast";
import { httpService } from "@/lib/httpService";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface FileStatus {
  id: string;
  name: string;
  isEnabled: boolean;
  createdAt: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function FileStatusesPage() {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusName, setStatusName] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { if (showForm) inputRef.current?.focus(); }, [showForm]);

  const load = async () => {
    try {
      setStatuses(await httpService.get<FileStatus[]>("/api/file-statuses"));
    } catch { router.push("/dashboard"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) return;
    setFormError(""); setCreating(true);
    try {
      await httpService.post("/api/file-statuses", { name: statusName });
      setShowForm(false); setStatusName("");
      toast("Status created", "success");
      await load();
    } catch (err: any) {
      setFormError(err instanceof Error ? err.message : "Failed to create status");
    } finally { setCreating(false); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      await httpService.put(`/api/file-statuses/${id}`, { isEnabled: !current });
      await load();
    } catch (err: any) {
      toast(err instanceof Error ? err.message : "Failed to update status");
    } finally { setToggling(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await httpService.delete(`/api/file-statuses/${deleteTarget.id}`);
      toast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      toast(err instanceof Error ? err.message : "Failed to delete");
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  const enabled = statuses.filter((s) => s.isEnabled).length;

  return (
    <AppShell title="File Statuses" backHref="/dashboard">
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete status?"
        message={`"${deleteTarget?.name ?? ""}" will be permanently removed.`}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl text-[#1A1814]">Statuses</h1>
            <p className="text-sm text-[#6B6560]">Stages files move through</p>
          </div>
          {showForm ? (
            <button
              onClick={() => { setShowForm(false); setFormError(""); setStatusName(""); }}
              className="inline-flex h-9 items-center rounded-md border border-[#E0DBD0] px-3.5 text-sm font-medium text-[#6B6560] transition-colors hover:bg-[#EEE9DF]">
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#C0392B] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
              <Plus className="size-4" />
              Add status
            </button>
          )}
        </div>

        {/* Inline add form */}
        {showForm && (
          <div
            className="rounded-xl border p-5 animate-fade-in"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
              New Status
            </h2>

            {formError && (
              <div className="rounded-lg px-3 py-2 text-sm mb-4" style={{ backgroundColor: "var(--color-dangerLight)", color: "var(--color-danger)" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                required
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                placeholder="e.g., Pending, In Progress, Approved"
                className="field flex-1"
              />
              <Button type="submit" size="sm" loading={creating} disabled={!statusName.trim()}>
                Create
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => { setShowForm(false); setFormError(""); setStatusName(""); }}
                disabled={creating}>
                Cancel
              </Button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--color-textMuted)" }}>
          <span><span className="font-semibold" style={{ color: "var(--color-text)" }}>{statuses.length}</span> total</span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: "var(--color-border)" }} />
          <span><span className="font-semibold" style={{ color: "var(--color-success)" }}>{enabled}</span> enabled</span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: "var(--color-border)" }} />
          <span><span className="font-semibold" style={{ color: "var(--color-textMuted)" }}>{statuses.length - enabled}</span> disabled</span>
        </div>

        {/* Table */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div
            className="grid grid-cols-[1fr_100px_160px_100px] px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wide"
            style={{ borderColor: "var(--color-border)", color: "var(--color-textMuted)", backgroundColor: "var(--color-backgroundAlt)" }}>
            <span>Status name</span>
            <span>State</span>
            <span>Created</span>
            <span />
          </div>

          {statuses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "var(--color-backgroundAlt)" }}>
                <svg className="w-5 h-5" style={{ color: "var(--color-textSubtle)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                  <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>No statuses yet</p>
              <p className="text-xs" style={{ color: "var(--color-textMuted)" }}>Create your first status to start tracking files</p>
            </div>
          ) : (
            statuses.map((s) => (
              <div
                key={s.id}
                className="data-row grid grid-cols-[1fr_100px_160px_100px] px-4 py-3 items-center border-b last:border-b-0"
                style={{ borderColor: "var(--color-borderLight)" }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.isEnabled ? "var(--color-success)" : "var(--color-textSubtle)" }} />
                  <span className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{s.name}</span>
                </div>

                {/* Toggle pill */}
                <button
                  onClick={() => handleToggle(s.id, s.isEnabled)}
                  disabled={toggling === s.id}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 w-fit"
                  style={{
                    backgroundColor: s.isEnabled ? "var(--color-successLight)" : "var(--color-backgroundAlt)",
                    color: s.isEnabled ? "var(--color-success)" : "var(--color-textMuted)",
                  }}>
                  {toggling === s.id ? (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" d="M12 2a10 10 0 0110 10"/>
                    </svg>
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full ${s.isEnabled ? "bg-current" : "bg-current opacity-40"}`} />
                  )}
                  {s.isEnabled ? "Enabled" : "Disabled"}
                </button>

                <span className="text-xs" style={{ color: "var(--color-textMuted)" }}>{fmtDate(s.createdAt)}</span>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleToggle(s.id, s.isEnabled)}
                    className="btn-icon w-7 h-7"
                    title={s.isEnabled ? "Disable" : "Enable"}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
                      {s.isEnabled
                        ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                        : <polyline points="20 6 9 17 4 12"/>}
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="btn-icon w-7 h-7"
                    title="Delete">
                    <svg className="w-3.5 h-3.5" style={{ color: "var(--color-danger)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
