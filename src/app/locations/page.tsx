"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageLoader } from "@/components/Loading";
import { useToast } from "@/components/Toast";
import { DEFAULT_BRANCH_TYPES } from "@/config/constant";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Location {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function LocationsPage() {
  const router = useRouter();
  const toast = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "Branch" });
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => { if (showForm) nameRef.current?.focus(); }, [showForm]);

  const load = async () => {
    try {
      setLocations(await httpService.get<Location[]>("/api/locations"));
    } catch { router.push("/dashboard"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setCreating(true);
    try {
      await httpService.post("/api/locations", formData);
      setShowForm(false);
      setFormData({ name: "", type: "Branch" });
      toast("Branch created", "success");
      await load();
    } catch (err: any) {
      setFormError(err instanceof Error ? err.message : "Failed to create branch");
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await httpService.delete(`/api/locations/${deleteTarget.id}`);
      toast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      toast(err instanceof Error ? err.message : "Failed to delete");
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <AppShell
      title="Offices & Branches"
      backHref="/dashboard"
      actions={
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Branch"}
        </Button>
      }>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete branch?"
        message={`"${deleteTarget?.name ?? ""}" will be permanently removed.`}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {/* Inline add form */}
        {showForm && (
          <div
            className="rounded-xl border p-5 animate-fade-in"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
              New Branch
            </h2>

            {formError && (
              <div className="rounded-lg px-3 py-2 text-sm mb-4" style={{ backgroundColor: "var(--color-dangerLight)", color: "var(--color-danger)" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-textMuted)" }}>
                    Branch Name
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Office, North Branch"
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-textMuted)" }}>
                    Type
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Branch type"
                    className="field"
                    list="branch-types"
                  />
                  <datalist id="branch-types">
                    {DEFAULT_BRANCH_TYPES.map((t) => <option key={t} value={t} />)}
                  </datalist>
                </div>
              </div>

              {/* Quick type chips */}
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_BRANCH_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors"
                    style={
                      formData.type === t
                        ? { backgroundColor: "var(--color-primary)", color: "#fff", borderColor: "var(--color-primary)" }
                        : { backgroundColor: "transparent", color: "var(--color-textMuted)", borderColor: "var(--color-border)" }
                    }>
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" loading={creating}>Create</Button>
                <Button size="sm" variant="secondary" onClick={() => { setShowForm(false); setFormError(""); }} disabled={creating}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          {/* Header */}
          <div
            className="grid grid-cols-[1fr_120px_160px_80px] px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wide"
            style={{ borderColor: "var(--color-border)", color: "var(--color-textMuted)", backgroundColor: "var(--color-backgroundAlt)" }}>
            <span>Name</span>
            <span>Type</span>
            <span>Created</span>
            <span />
          </div>

          {locations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "var(--color-backgroundAlt)" }}>
                <svg className="w-5 h-5" style={{ color: "var(--color-textSubtle)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>No branches yet</p>
              <p className="text-xs" style={{ color: "var(--color-textMuted)" }}>Add your first branch to get started</p>
            </div>
          ) : (
            locations.map((loc, i) => (
              <div
                key={loc.id}
                className="data-row grid grid-cols-[1fr_120px_160px_80px] px-4 py-3 items-center border-b last:border-b-0"
                style={{ borderColor: "var(--color-borderLight)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ backgroundColor: "var(--color-backgroundAlt)", color: "var(--color-textMuted)" }}>
                    {loc.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>{loc.name}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-semibold w-fit"
                  style={{ backgroundColor: "var(--color-infoLight)", color: "var(--color-info)" }}>
                  {loc.type}
                </span>
                <span className="text-xs" style={{ color: "var(--color-textMuted)" }}>{fmtDate(loc.createdAt)}</span>
                <div className="flex justify-end">
                  <button
                    onClick={() => setDeleteTarget(loc)}
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

        <p className="text-xs px-1" style={{ color: "var(--color-textSubtle)" }}>
          {locations.length} {locations.length === 1 ? "branch" : "branches"} · Files are tracked as they move between branches
        </p>
      </div>
    </AppShell>
  );
}
