// app/dashboard/page.tsx
"use client";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/Loading";
import { Menu } from "@/components/Menu";
import type { File } from "@/features/files/file.types";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  isOwner: boolean;
  email: string;
  canManageLocations: boolean;
  canConfigureStatuses: boolean;
}

type FilterType = "all" | "active" | "completed";

export default function DashboardPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const filterParam = filter === "all" ? "" : `?filter=${filter}`;
      const [filesData, userData] = await Promise.all([httpService.get<File[]>(`/api/files${filterParam}`), httpService.get<User>("/api/auth/me")]);
      setFiles(filesData);
      setUser(userData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter((file) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      file.clientName.toLowerCase().includes(query) ||
      file.serviceType.toLowerCase().includes(query) ||
      file.currentStatus.name.toLowerCase().includes(query) ||
      file.currentLocation.name.toLowerCase().includes(query)
    );
  });

  const formatDate = (date: Date) => {
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
      <div className='relative max-w-7xl mx-auto'>
        <Header title='Dashboard' showMenu onMenuClick={() => setShowMenu(!showMenu)} />
        {showMenu && user && (
          <Menu
            isOpen={showMenu}
            email={user.email}
            isOwner={user.isOwner}
            canManageLocations={user.canManageLocations}
            canConfigureStatuses={user.canConfigureStatuses}
            onClose={() => setShowMenu(false)}
          />
        )}
      </div>

      <main className='pb-24'>
        <div
          className='px-4 py-6 border-b backdrop-blur-sm'
          style={{
            backgroundColor: "var(--color-backgroundAlt)",
            borderColor: "var(--color-border)",
            borderTop: "none",
          }}>
          <div className='max-w-7xl mx-auto space-y-4'>
            {/* Search Bar with Icon */}
            <div className='relative group'>
              <svg
                className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors'
                style={{ color: "var(--color-textMuted)" }}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search files...'
                className='w-full pl-12 pr-12 py-3.5 rounded-2xl border transition-all duration-200 placeholder:text-sm'
                style={
                  {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    "--tw-ring-color": "var(--color-primary)",
                  } as any
                }
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--color-primary-rgb, 59, 130, 246), 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10 active:scale-95'
                  style={{
                    color: "var(--color-textMuted)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Pills & Results */}
            <div className='flex items-center gap-3 flex-wrap'>
              <div className='flex gap-2'>
                {(["all", "active", "completed"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                      filter === f ? "shadow-sm" : "hover:shadow-sm"
                    }`}
                    style={
                      filter === f
                        ? {
                            backgroundColor: "var(--color-primary)",
                            color: "white",
                            border: "none",
                          }
                        : {
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-textMuted)",
                            borderWidth: "1px",
                            borderColor: "var(--color-border)",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (filter !== f) {
                        e.currentTarget.style.borderColor = "var(--color-primary)";
                        e.currentTarget.style.color = "var(--color-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (filter !== f) {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                        e.currentTarget.style.color = "var(--color-textMuted)";
                      }
                    }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {searchQuery && (
                <div
                  className='rounded-full px-4 py-2 text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300'
                  style={{
                    backgroundColor: "var(--color-infoLight)",
                    color: "var(--color-info)",
                    border: "1px solid var(--color-info)",
                  }}>
                  {filteredFiles.length} {filteredFiles.length === 1 ? "result" : "results"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='px-4 pt-4 space-y-3 items-center justify-between max-w-7xl mx-auto'>
          {filteredFiles.length === 0 ? (
            <Card className='hover:shadow-lg'>
              <div className='text-center py-8'>
                <p className='font-medium mb-1' style={{ color: "var(--color-text)" }}>
                  {searchQuery ? "No files found" : "No files yet"}
                </p>
                <p className='text-sm' style={{ color: "var(--color-textMuted)" }}>
                  {searchQuery ? "Try a different search" : "Create your first file"}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className='mt-3 text-sm font-medium' style={{ color: "var(--color-primary)" }}>
                    Clear search
                  </button>
                )}
              </div>
            </Card>
          ) : (
            filteredFiles.map((file) => (
              <Card key={file.id} onClick={() => router.push(`/files/${file.id}`)} className='hover:shadow-md active:scale-96'>
                <div className='space-y-3'>
                  <div className='flex justify-between items-start gap-3'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-bold text-base truncate' style={{ color: "var(--color-text)" }}>
                        {file.clientName}
                      </h3>
                    </div>
                    <Badge variant={file.isCompleted ? "success" : "warning"}>{file.currentStatus.name}</Badge>
                  </div>

                  <div
                    className='rounded-lg px-3 py-2 border'
                    style={{ backgroundColor: "var(--color-backgroundAlt)", borderColor: "var(--color-border)" }}>
                    <p className='text-sm font-medium' style={{ color: "var(--color-text)" }}>
                      {file.serviceType}
                    </p>
                  </div>

                  <div className='flex justify-between items-center pt-2 border-t' style={{ borderColor: "var(--color-borderLight)" }}>
                    <div className='flex items-center gap-1.5 text-sm font-medium truncate flex-1' style={{ color: "var(--color-textMuted)" }}>
                      <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      <span className='truncate'>{file.currentLocation.name}</span>
                    </div>
                    <div
                      className='flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ml-2 whitespace-nowrap'
                      style={{ backgroundColor: "var(--color-backgroundAlt)", color: "var(--color-textMuted)" }}>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                      <span>{formatDate(file.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <div
        className='fixed bottom-0 left-0 right-0 p-4 border-t'
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div className='max-w-7xl mx-auto'>
          <Button onClick={() => router.push("/files/new")}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z'
                fill='#ffffff'
              />
            </svg>
            New File
          </Button>
        </div>
      </div>
    </div>
  );
}
