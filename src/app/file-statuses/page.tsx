// app/file-statuses/page.tsx
"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/Loading";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FileStatus {
  id: string;
  name: string;
  isEnabled: boolean;
  createdAt: string;
}

export default function FileStatusesPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusName, setStatusName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const data = await httpService.get<FileStatus[]>("/api/file-statuses");
      setStatuses(data);
    } catch (err) {
      console.error("Failed to load statuses:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) return;

    setError("");
    setCreating(true);

    try {
      await httpService.post("/api/file-statuses", { name: statusName });
      setShowAddForm(false);
      setStatusName("");
      await loadStatuses();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to create status");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    try {
      await httpService.put(`/api/file-statuses/${id}`, { isEnabled: !currentEnabled });
      await loadStatuses();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await httpService.delete(`/api/file-statuses/${id}`);
      await loadStatuses();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : "Failed to delete status");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: "var(--color-background)" }}>
      <Header title='File Statuses' showBack />

      <main className='max-w-4xl mx-auto px-4 py-4 pb-24'>
        <div className='mb-4'>
          <Button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Cancel" : "+ Add Status"}</Button>
        </div>

        {showAddForm && (
          <Card className='mb-4'>
            <h2 className='text-lg font-bold mb-4' style={{ color: "var(--color-text)" }}>
              Add New Status
            </h2>
            {error && (
              <div
                className='mb-4 rounded-xl border-2 p-3 text-sm font-semibold'
                style={{ backgroundColor: "var(--color-dangerLight)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                {error}
              </div>
            )}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                  Status Name
                </label>
                <input
                  type='text'
                  required
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && statusName.trim()) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  placeholder='e.g., Pending, In Progress'
                  className='block w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-all'
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

              <div className='flex gap-3'>
                <Button onClick={(e) => handleSubmit(e)} disabled={!statusName.trim()} loading={creating}>
                  Create Status
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setShowAddForm(false);
                    setError("");
                    setStatusName("");
                  }}
                  disabled={creating}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {statuses.length === 0 ? (
          <Card>
            <div className='text-center py-8'>
              <p className='font-semibold text-lg mb-1' style={{ color: "var(--color-text)" }}>
                No statuses found
              </p>
              <p className='text-sm' style={{ color: "var(--color-textMuted)" }}>
                Create your first status to track files
              </p>
            </div>
          </Card>
        ) : (
          <div className='space-y-3'>
            {statuses.map((status) => (
              <Card key={status.id}>
                <div className='flex flex-col space-y-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-bold truncate' style={{ color: "var(--color-text)" }}>
                        {status.name}
                      </h3>
                      <p className='text-xs font-medium mt-1' style={{ color: "var(--color-textMuted)" }}>
                        Created {formatDate(status.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleEnabled(status.id, status.isEnabled)}
                      className='px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all active:scale-95'
                      style={{
                        backgroundColor: status.isEnabled ? "var(--color-successLight)" : "var(--color-backgroundAlt)",
                        color: status.isEnabled ? "var(--color-success)" : "var(--color-textMuted)",
                      }}>
                      {status.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div className='flex gap-2 pt-2 border-t' style={{ borderColor: "var(--color-borderLight)" }}>
                    <button
                      onClick={() => handleToggleEnabled(status.id, status.isEnabled)}
                      className='flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all active:scale-95'
                      style={{ backgroundColor: "var(--color-primaryLight)", color: "var(--color-text)" }}>
                      {status.isEnabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDelete(status.id, status.name)}
                      className='flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all active:scale-95'
                      style={{ backgroundColor: "var(--color-danger)" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className='mt-6' style={{ backgroundColor: "var(--color-infoLight)", borderColor: "var(--color-info)" }}>
          <h3 className='text-base font-bold mb-3' style={{ color: "var(--color-info)" }}>
            About File Statuses
          </h3>
          <ul className='text-sm space-y-2' style={{ color: "var(--color-info)" }}>
            <li>• Track progress through your workflow</li>
            <li>• Enabled statuses appear in dropdowns</li>
            <li>• Disabled statuses are hidden but preserved</li>
            <li>• Cannot delete statuses in use by files</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
