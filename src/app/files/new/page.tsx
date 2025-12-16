// app/files/new/page.tsx
"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/Loading";
import { SERVICE_TYPES } from "@/config/constant";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [clientName, setClientName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [currentLocationId, setCurrentLocationId] = useState("");
  const [currentStatusId, setCurrentStatusId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

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

      let filteredLocations = locationsData;
      if (!userData.isOwner && userData.assignedLocationId) {
        filteredLocations = locationsData.filter((loc) => loc.id === userData.assignedLocationId || loc.type === "RTO");
      }

      setLocations(filteredLocations);

      if (filteredLocations.length > 0) {
        if (!userData.isOwner && userData.assignedLocationId) {
          setCurrentLocationId(userData.assignedLocationId);
        } else {
          setCurrentLocationId(filteredLocations[0].id);
        }
      }
      if (statusesData.length > 0) {
        setCurrentStatusId(statusesData[0].id);
      }
      if (SERVICE_TYPES.length > 0) {
        setServiceType(SERVICE_TYPES[0]);
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
      await httpService.post("/api/files", {
        clientName,
        serviceType,
        currentLocationId,
        currentStatusId,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create file");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <PageLoader />;
  }

  const canSubmit = !loading && locations.length > 0 && statuses.length > 0 && clientName.trim();

  return (
    <div className='min-h-screen' style={{ backgroundColor: "var(--color-background)" }}>
      <Header title='New File' showBack />

      <main className='max-w-3xl mx-auto px-4 py-4 pb-32'>
        <Card>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold mb-1' style={{ color: "var(--color-text)" }}>
              Create New File
            </h2>
            <p className='text-sm' style={{ color: "var(--color-textMuted)" }}>
              Fill in the details below
            </p>
          </div>

          <div className='space-y-5'>
            {error && (
              <div
                className='rounded-xl border-2 p-4 text-sm font-semibold'
                style={{ backgroundColor: "var(--color-dangerLight)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor='clientName' className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                Client Name
              </label>
              <input
                id='clientName'
                type='text'
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder='Enter client full name'
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

            <div>
              <label htmlFor='serviceType' className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                Service Type
              </label>
              <select
                id='serviceType'
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className='block w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-all'
                style={
                  {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    "--tw-ring-color": "var(--color-primary)",
                  } as any
                }>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor='currentLocationId' className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                Current Location
              </label>
              <select
                id='currentLocationId'
                required
                value={currentLocationId}
                onChange={(e) => setCurrentLocationId(e.target.value)}
                className='block w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-all'
                style={
                  {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    "--tw-ring-color": "var(--color-primary)",
                  } as any
                }>
                {locations.length === 0 ? (
                  <option value=''>No locations available</option>
                ) : (
                  locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </option>
                  ))
                )}
              </select>
              {locations.length === 0 && (
                <p
                  className='mt-2 text-sm font-semibold rounded-lg p-2 border'
                  style={{ backgroundColor: "var(--color-dangerLight)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                  Please create at least one location first
                </p>
              )}
              {!user?.isOwner && user?.assignedLocationId && (
                <p
                  className='mt-2 text-xs font-medium rounded-lg p-2'
                  style={{ backgroundColor: "var(--color-infoLight)", color: "var(--color-info)" }}>
                  You can create files in your assigned office or any RTO location
                </p>
              )}
            </div>

            <div>
              <label htmlFor='currentStatusId' className='block text-sm font-semibold mb-2' style={{ color: "var(--color-text)" }}>
                Current Status
              </label>
              <select
                id='currentStatusId'
                required
                value={currentStatusId}
                onChange={(e) => setCurrentStatusId(e.target.value)}
                className='block w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-all'
                style={
                  {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    "--tw-ring-color": "var(--color-primary)",
                  } as any
                }>
                {statuses.length === 0 ? (
                  <option value=''>No statuses available</option>
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
                  className='mt-2 text-sm font-semibold rounded-lg p-2 border'
                  style={{ backgroundColor: "var(--color-dangerLight)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                  Please create at least one status first
                </p>
              )}
            </div>
          </div>
        </Card>

        <div
          className='fixed bottom-0 left-0 right-0 p-4 border-t'
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className='max-w-3xl mx-auto flex flex-col gap-3'>
            <Button onClick={() => handleSubmit()} disabled={!canSubmit} loading={loading}>
              Create File
            </Button>
            <Button variant='secondary' onClick={() => router.push("/dashboard")} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
