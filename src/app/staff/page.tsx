// app/staff/page.tsx
"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/Loading";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function StaffManagementPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "STAFF",
    assignedLocationId: "",
    canViewAllFiles: false,
    canManageLocations: false,
    canConfigureStatuses: false,
    canManageStaff: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffData, locationsData] = await Promise.all([
        httpService.get<StaffUser[]>("/api/staff"),
        httpService.get<Location[]>("/api/locations?type=OFFICE"),
      ]);
      setStaff(staffData);
      setLocations(locationsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await httpService.post("/api/staff", formData);
      setShowAddForm(false);
      setFormData({
        email: "",
        password: "",
        role: "STAFF",
        assignedLocationId: "",
        canViewAllFiles: false,
        canManageLocations: false,
        canConfigureStatuses: false,
        canManageStaff: false,
      });
      await loadData();
    } catch (err) {
      console.error("Failed to create staff:", err);
      alert("Failed to create staff member");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete staff member "${email}"?`)) return;
    try {
      await httpService.delete(`/api/staff/${id}`);
      await loadData();
    } catch (err) {
      console.error("Failed to delete staff:", err);
      alert("Failed to delete staff member");
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: "var(--color-background)" }}>
      <Header title='Staff Management' showBack />

      <main className='max-w-4xl mx-auto px-4 py-4 pb-24'>
        {showAddForm && (
          <Card className='mb-4'>
            <h2 className='text-lg font-bold mb-4' style={{ color: "var(--color-text)" }}>
              Add Staff Member
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                  Email
                </label>
                <input
                  type='email'
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder='staff@example.com'
                  className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all'
                  style={
                    {
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                      "--tw-ring-color": "var(--color-primary)",
                    } as any
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                  Password
                </label>
                <input
                  type='password'
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder='Strong password'
                  className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all'
                  style={
                    {
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                      "--tw-ring-color": "var(--color-primary)",
                    } as any
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                  Assigned Office
                </label>
                <select
                  value={formData.assignedLocationId}
                  onChange={(e) => setFormData({ ...formData, assignedLocationId: e.target.value })}
                  className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all'
                  style={
                    {
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                      "--tw-ring-color": "var(--color-primary)",
                    } as any
                  }>
                  <option value=''>None (Access all)</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                  Permissions
                </label>
                <div className='space-y-2'>
                  <label
                    className='flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors'
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                    <input
                      type='checkbox'
                      checked={formData.canViewAllFiles}
                      onChange={(e) => setFormData({ ...formData, canViewAllFiles: e.target.checked })}
                      className='w-4 h-4 rounded'
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    <div className='flex-1'>
                      <span className='text-sm font-semibold block' style={{ color: "var(--color-text)" }}>
                        View All Files
                      </span>
                      <span className='text-xs' style={{ color: "var(--color-textMuted)" }}>
                        Access files from all locations
                      </span>
                    </div>
                  </label>

                  <label
                    className='flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors'
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                    <input
                      type='checkbox'
                      checked={formData.canManageLocations}
                      onChange={(e) => setFormData({ ...formData, canManageLocations: e.target.checked })}
                      className='w-4 h-4 rounded'
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    <div className='flex-1'>
                      <span className='text-sm font-semibold block' style={{ color: "var(--color-text)" }}>
                        Manage Locations
                      </span>
                      <span className='text-xs' style={{ color: "var(--color-textMuted)" }}>
                        Create, edit, and delete locations
                      </span>
                    </div>
                  </label>

                  <label
                    className='flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors'
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                    <input
                      type='checkbox'
                      checked={formData.canConfigureStatuses}
                      onChange={(e) => setFormData({ ...formData, canConfigureStatuses: e.target.checked })}
                      className='w-4 h-4 rounded'
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    <div className='flex-1'>
                      <span className='text-sm font-semibold block' style={{ color: "var(--color-text)" }}>
                        Configure Statuses
                      </span>
                      <span className='text-xs' style={{ color: "var(--color-textMuted)" }}>
                        Manage file status options
                      </span>
                    </div>
                  </label>

                  <label
                    className='flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors'
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                    <input
                      type='checkbox'
                      checked={formData.canManageStaff}
                      onChange={(e) => setFormData({ ...formData, canManageStaff: e.target.checked })}
                      className='w-4 h-4 rounded'
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    <div className='flex-1'>
                      <span className='text-sm font-semibold block' style={{ color: "var(--color-text)" }}>
                        Manage Staff
                      </span>
                      <span className='text-xs' style={{ color: "var(--color-textMuted)" }}>
                        Add and remove staff members
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className='flex gap-3 pt-2'>
                <Button type='submit' loading={creating}>
                  Create Staff Member
                </Button>
                <Button variant='secondary' onClick={() => setShowAddForm(false)} disabled={creating}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {staff.length === 0 ? (
          <Card>
            <div className='text-center py-12'>
              <p className='font-semibold text-lg mb-1' style={{ color: "var(--color-text)" }}>
                No staff members yet
              </p>
              <p className='text-sm' style={{ color: "var(--color-textMuted)" }}>
                Add your first staff member to get started
              </p>
            </div>
          </Card>
        ) : (
          <div className='space-y-3'>
            {staff.map((s) => (
              <Card key={s.id}>
                <div className='space-y-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-base font-bold truncate' style={{ color: "var(--color-text)" }}>
                        {s.email}
                      </h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <svg
                          className='w-4 h-4 shrink-0'
                          style={{ color: "var(--color-textMuted)" }}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                          />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                        <p className='text-sm truncate' style={{ color: "var(--color-textMuted)" }}>
                          {s.assignedLocation?.name || "All locations"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(s.canViewAllFiles || s.canManageLocations || s.canConfigureStatuses || s.canManageStaff) && (
                    <div className='flex flex-wrap gap-2'>
                      {s.canViewAllFiles && (
                        <span
                          className='px-2.5 py-1 text-xs font-semibold rounded-full'
                          style={{ backgroundColor: "var(--color-infoLight)", color: "var(--color-info)" }}>
                          View All Files
                        </span>
                      )}
                      {s.canManageLocations && (
                        <span
                          className='px-2.5 py-1 text-xs font-semibold rounded-full'
                          style={{ backgroundColor: "var(--color-primaryLight)", color: "var(--color-primary)" }}>
                          Manage Locations
                        </span>
                      )}
                      {s.canConfigureStatuses && (
                        <span
                          className='px-2.5 py-1 text-xs font-semibold rounded-full'
                          style={{ backgroundColor: "var(--color-successLight)", color: "var(--color-success)" }}>
                          Configure Statuses
                        </span>
                      )}
                      {s.canManageStaff && (
                        <span
                          className='px-2.5 py-1 text-xs font-semibold rounded-full'
                          style={{ backgroundColor: "var(--color-warningLight)", color: "var(--color-warning)" }}>
                          Manage Staff
                        </span>
                      )}
                    </div>
                  )}

                  <div className='pt-2 border-t' style={{ borderColor: "var(--color-borderLight)" }}>
                    <button
                      onClick={() => handleDelete(s.id, s.email)}
                      className='text-sm font-semibold transition-colors'
                      style={{ color: "var(--color-danger)" }}>
                      Delete Staff Member
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className='mt-4'>
          <Button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Cancel" : "+ Add Staff Member"}</Button>
        </div>

        <Card className='mt-6' style={{ backgroundColor: "var(--color-infoLight)", borderColor: "var(--color-info)" }}>
          <h3 className='text-base font-bold mb-3' style={{ color: "var(--color-info)" }}>
            About Staff Management
          </h3>
          <ul className='text-sm space-y-2' style={{ color: "var(--color-info)" }}>
            <li>• Staff can be assigned to specific offices or have access to all locations</li>
            <li>• Permissions control what actions staff members can perform</li>
            <li>• Staff without "View All Files" can only see files at their assigned location</li>
            <li>• Multiple permissions can be granted to a single staff member</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
