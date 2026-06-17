// app/system/organizations/page.tsx
"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageLoader } from "@/components/Loading";
import { httpService } from "@/lib/httpService";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  ownerUserId: string;
  owner: {
    id: string;
    email: string;
  };
  createdAt: string;
}

export default function SystemOrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ownerEmail: "",
    ownerPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const data = await httpService.get<Organization[]>("/api/system/organizations");
      setOrganizations(data);
    } catch (err) {
      console.error("Failed to load organizations:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    
    try {
      await httpService.post("/api/system/organizations", formData);
      setShowAddForm(false);
      setFormData({
        name: "",
        ownerEmail: "",
        ownerPassword: "",
      });
      await loadOrganizations();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this organization? All data will be lost.")) {
      return;
    }
    try {
      await httpService.delete(`/api/system/organizations/${id}`);
      await loadOrganizations();
    } catch (err) {
      console.error("Failed to delete organization:", err);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <header className="border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              System Admin - Organizations
            </h1>
            <button onClick={handleLogout} className="text-sm font-medium" style={{ color: 'var(--color-textMuted)' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "+ Create Organization"}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Create New Organization
            </h2>
            {error && (
              <div className="mb-4 rounded-xl p-3 text-sm" style={{ backgroundColor: 'var(--color-dangerLight)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                  className="block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Owner Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="owner@example.com"
                  className="block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Owner Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.ownerPassword}
                  onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                  placeholder="Strong password"
                  className="block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" loading={creating}>
                  Create Organization
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setError("");
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {organizations.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                No organizations found
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {organizations.map((org) => (
              <Card key={org.id}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                      {org.name}
                    </h3>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-textMuted)' }}>
                      Owner: {org.owner.email}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      Created {formatDate(org.createdAt)}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(org.id)} 
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-95 self-start sm:self-center"
                    style={{ backgroundColor: 'var(--color-danger)' }}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}