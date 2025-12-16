// app/locations/page.tsx
"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/Loading";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Location {
  id: string;
  name: string;
  type: "OFFICE" | "RTO";
  createdAt: string;
}

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "OFFICE" as "OFFICE" | "RTO",
  });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await httpService.get<Location[]>("/api/locations");
      setLocations(data);
    } catch (err) {
      console.error("Failed to load locations:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      await httpService.post("/api/locations", formData);
      setShowAddForm(false);
      setFormData({ name: "", type: "OFFICE" });
      await loadLocations();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to create location");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await httpService.delete(`/api/locations/${id}`);
      await loadLocations();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : "Failed to delete location");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: "var(--color-background)" }}>
      <Header title='Locations' showBack />

      <main className='pb-24'>
        {showAddForm && (
          <div className='px-4 py-4'>
            <Card>
              <h2 className='font-semibold mb-4' style={{ color: "var(--color-text)" }}>
                Add Location
              </h2>
              {error && (
                <div
                  className='mb-4 rounded-xl border p-3 text-sm'
                  style={{ backgroundColor: "var(--color-dangerLight)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                    Location Name
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='e.g., Main Office, Jalna RTO'
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
                    Type
                  </label>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => setFormData({ ...formData, type: "OFFICE" })}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.type === "OFFICE" ? "text-white" : ""}`}
                      style={
                        formData.type === "OFFICE"
                          ? { backgroundColor: "var(--color-primary)" }
                          : {
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text)",
                              borderWidth: "1px",
                              borderColor: "var(--color-border)",
                            }
                      }>
                      Office
                    </button>
                    <button
                      type='button'
                      onClick={() => setFormData({ ...formData, type: "RTO" })}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.type === "RTO" ? "text-white" : ""}`}
                      style={
                        formData.type === "RTO"
                          ? { backgroundColor: "var(--color-primary)" }
                          : {
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text)",
                              borderWidth: "1px",
                              borderColor: "var(--color-border)",
                            }
                      }>
                      RTO
                    </button>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button type='submit' loading={creating}>
                    Create
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setShowAddForm(false);
                      setError("");
                    }}
                    disabled={creating}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <div className='px-4 py-4 space-y-3'>
          {locations.length === 0 ? (
            <Card>
              <div className='text-center py-12'>
                <p className='font-medium mb-1' style={{ color: "var(--color-text)" }}>
                  No locations yet
                </p>
                <p className='text-sm' style={{ color: "var(--color-textMuted)" }}>
                  Add your first office or RTO
                </p>
              </div>
            </Card>
          ) : (
            locations.map((location) => (
              <Card key={location.id}>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h3 className='font-semibold' style={{ color: "var(--color-text)" }}>
                      {location.name}
                    </h3>
                    <p className='text-sm mt-1' style={{ color: "var(--color-textMuted)" }}>
                      Added {formatDate(location.createdAt)}
                    </p>
                  </div>
                  <span
                    className='px-2 py-1 text-xs font-semibold rounded-full'
                    style={{
                      backgroundColor: location.type === "OFFICE" ? "var(--color-infoLight)" : "var(--color-primaryLight)",
                      color: location.type === "OFFICE" ? "var(--color-info)" : "var(--color-primary)",
                    }}>
                    {location.type}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(location.id, location.name)}
                  className='text-sm font-medium'
                  style={{ color: "var(--color-danger)" }}>
                  Delete
                </button>
              </Card>
            ))
          )}
        </div>

        <div className='px-4 py-4'>
          <Card style={{ backgroundColor: "var(--color-infoLight)", borderColor: "var(--color-info)" }}>
            <h3 className='text-sm font-bold mb-2' style={{ color: "var(--color-info)" }}>
              About Locations
            </h3>
            <ul className='text-sm space-y-1' style={{ color: "var(--color-info)" }}>
              <li>
                • <strong>OFFICE</strong> - Your branch offices
              </li>
              <li>
                • <strong>RTO</strong> - Transport offices
              </li>
              <li>• Staff can be assigned to offices</li>
            </ul>
          </Card>
        </div>
      </main>

      <div
        className='fixed bottom-0 left-0 right-0 p-4 border-t'
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <Button onClick={() => setShowAddForm(true)}>+ Add Location</Button>
      </div>
    </div>
  );
}
