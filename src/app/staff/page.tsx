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

interface StaffUser {
  id: string;
  email: string;
  role: string;
  assignedLocationId: string | null;
  assignedLocation?: { id: string; name: string; type: string } | null;
  canViewAllFiles: boolean;
  canManageOffices: boolean;
  canManageStaff: boolean;
  canConfigureStatuses: boolean;
  canManageLocations: boolean;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

const DEFAULT_FORM = {
  email: "",
  password: "",
  role: "STAFF",
  assignedLocationId: "",
  canViewAllFiles: false,
  canManageLocations: false,
  canConfigureStatuses: false,
  canManageStaff: false,
};

const PERMS = [
  { key: "canViewAllFiles" as const, label: "View All Files", desc: "Access files from all locations" },
  { key: "canManageLocations" as const, label: "Manage Branches", desc: "Create, edit, and delete branches" },
  { key: "canConfigureStatuses" as const, label: "Configure Statuses", desc: "Manage file status options" },
  { key: "canManageStaff" as const, label: "Manage Staff", desc: "Add and remove staff members" },
];

const PERM_COLORS: Record<string, { bg: string; color: string }> = {
  canViewAllFiles:      { bg: "var(--color-infoLight)",    color: "var(--color-info)" },
  canManageLocations:   { bg: "var(--color-primaryLight)", color: "var(--color-primary)" },
  canConfigureStatuses: { bg: "var(--color-successLight)", color: "var(--color-success)" },
  canManageStaff:       { bg: "var(--color-warningLight)", color: "var(--color-warning)" },
};

export default function StaffManagementPage() {
  const router = useRouter();
  const toast = useToast();
  const emailRef = useRef<HTMLInputElement>(null);

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => { if (showForm) emailRef.current?.focus(); }, [showForm]);

  const load = async () => {
    try {
      const [staffData, locData] = await Promise.all([
        httpService.get<StaffUser[]>("/api/staff"),
        httpService.get<Location[]>("/api/locations"),
      ]);
      setStaff(staffData);
      setLocations(locData);
    } catch { router.push("/dashboard"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setCreating(true);
    try {
      await httpService.post("/api/staff", formData);
      setShowForm(false); setFormData(DEFAULT_FORM);
      toast("Staff member created", "success");
      await load();
    } catch (err: any) {
      setFormError(err instanceof Error ? err.message : "Failed to create staff member");
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await httpService.delete(`/api/staff/${deleteTarget.id}`);
      toast(`${deleteTarget.email} removed`, "success");
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      toast(err instanceof Error ? err.message : "Failed to remove");
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  const initials = (email: string) => email[0]?.toUpperCase() ?? "?";

  if (loading) return <PageLoader />;

  return (
    <AppShell title="Employees" backHref="/dashboard">
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Remove staff member?"
        message={`${deleteTarget?.email ?? ""} will be permanently removed from your organization.`}
        confirmLabel={deleting ? "Removing…" : "Remove"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl text-[#1A1814]">Team</h1>
            <p className="text-sm text-[#6B6560]">People who can access this workspace</p>
          </div>
          {showForm ? (
            <button
              onClick={() => { setShowForm(false); setFormError(""); }}
              className="inline-flex h-9 items-center rounded-md border border-[#E0DBD0] px-3.5 text-sm font-medium text-[#6B6560] transition-colors hover:bg-[#EEE9DF]">
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#C0392B] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
              <Plus className="size-4" />
              Invite member
            </button>
          )}
        </div>

        {/* Inline add form */}
        {showForm && (
          <div
            className="rounded-xl border p-5 animate-fade-in"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
              New Staff Member
            </h2>

            {formError && (
              <div className="rounded-lg px-3 py-2 text-sm mb-4" style={{ backgroundColor: "var(--color-dangerLight)", color: "var(--color-danger)" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-textMuted)" }}>Email</label>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@example.com"
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-textMuted)" }}>Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Strong password"
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-textMuted)" }}>Assigned Office</label>
                <select
                  value={formData.assignedLocationId}
                  onChange={(e) => setFormData({ ...formData, assignedLocationId: e.target.value })}
                  className="field field-select">
                  <option value="">None — access all branches</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-textMuted)" }}>Permissions</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {PERMS.map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                      style={{
                        backgroundColor: formData[key] ? "var(--color-primaryLight)" : "var(--color-backgroundAlt)",
                        borderColor: formData[key] ? "var(--color-primary)" : "var(--color-border)",
                      }}>
                      <input
                        type="checkbox"
                        checked={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        className="mt-0.5 w-3.5 h-3.5 shrink-0"
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <div>
                        <span className="text-xs font-semibold block" style={{ color: "var(--color-text)" }}>{label}</span>
                        <span className="text-[11px]" style={{ color: "var(--color-textMuted)" }}>{desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" loading={creating}>Create Staff Member</Button>
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
          <div
            className="grid grid-cols-[2fr_1fr_2fr_60px] px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wide"
            style={{ borderColor: "var(--color-border)", color: "var(--color-textMuted)", backgroundColor: "var(--color-backgroundAlt)" }}>
            <span>Employee</span>
            <span>Office</span>
            <span>Permissions</span>
            <span />
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "var(--color-backgroundAlt)" }}>
                <svg className="w-5 h-5" style={{ color: "var(--color-textSubtle)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4" strokeWidth={1.8}/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>No staff members yet</p>
              <p className="text-xs" style={{ color: "var(--color-textMuted)" }}>Add your first staff member to get started</p>
            </div>
          ) : (
            staff.map((s) => {
              const perms = PERMS.filter(({ key }) => s[key]);
              return (
                <div
                  key={s.id}
                  className="data-row grid grid-cols-[2fr_1fr_2fr_60px] px-4 py-3 items-center border-b last:border-b-0"
                  style={{ borderColor: "var(--color-borderLight)" }}>
                  {/* Email + avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}>
                      {initials(s.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{s.email}</p>
                      <p className="text-[11px]" style={{ color: "var(--color-textMuted)" }}>Staff</p>
                    </div>
                  </div>

                  {/* Office */}
                  <span className="text-xs truncate" style={{ color: "var(--color-textMuted)" }}>
                    {s.assignedLocation?.name ?? "All branches"}
                  </span>

                  {/* Permissions */}
                  <div className="flex flex-wrap gap-1.5">
                    {perms.length === 0 ? (
                      <span className="text-xs" style={{ color: "var(--color-textSubtle)" }}>No extra permissions</span>
                    ) : perms.map(({ key, label }) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{ backgroundColor: PERM_COLORS[key].bg, color: PERM_COLORS[key].color }}>
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="btn-icon w-7 h-7"
                      title="Remove">
                      <svg className="w-3.5 h-3.5" style={{ color: "var(--color-danger)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs px-1" style={{ color: "var(--color-textSubtle)" }}>
          {staff.length} {staff.length === 1 ? "employee" : "employees"}
        </p>
      </div>
    </AppShell>
  );
}
