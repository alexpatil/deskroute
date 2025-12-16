// components/Menu.tsx
"use client";

import { httpService } from "@/lib/httpService";
import { ThemeName } from "@/lib/theme-config";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

interface MenuProps {
  isOpen: boolean;
  isOwner: boolean;
  email: string;
  canManageLocations: boolean;
  canConfigureStatuses: boolean;
  onClose: () => void;
}

export function Menu({ isOpen, email, isOwner, canManageLocations, canConfigureStatuses, onClose }: MenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className='absolute top-full right-4 mt-2 w-64 rounded-xl shadow-xl z-50 border'
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}>
      <div className='p-3 space-y-1'>
        {/* THEME */}
        <div className='pb-2 mb-2 border-b' style={{ borderColor: "var(--color-border)" }}>
          <p className='text-xs font-semibold px-3 py-1' style={{ color: "var(--color-textMuted)" }}>
            Theme
          </p>

          <div className='flex gap-3 px-3 py-2'>
            {(
              [
                { name: "light", color: "#e5e7eb" },
                { name: "yellow", color: "#facc15" },
                { name: "dark", color: "#0f172a" },
              ] as { name: ThemeName; color: string }[]
            ).map(({ name, color }) => (
              <button
                key={name}
                onClick={() => setTheme(name)}
                className={`w-7 h-7 rounded-full transition ring-offset-2 ${theme === name ? "ring-2" : ""}`}
                style={{
                  backgroundColor: color,
                }}
                title={name}
              />
            ))}
          </div>
        </div>

        {/* OWNER */}
        {isOwner && (
          <>
            <MenuBtn label='Staff Management' onClick={() => router.push("/staff")} />
            <MenuBtn label='Locations' onClick={() => router.push("/locations")} />
            <MenuBtn label='File Statuses' onClick={() => router.push("/file-statuses")} />
          </>
        )}

        {!isOwner && canManageLocations && <MenuBtn label='Locations' onClick={() => router.push("/locations")} />}

        {!isOwner && canConfigureStatuses && <MenuBtn label='File Statuses' onClick={() => router.push("/file-statuses")} />}

        <MenuBtn label={email} onClick={() => {}} />

        <div className='pt-2 mt-2 border-t' style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={async () => {
              await httpService.post("/api/auth/logout");
              router.push("/login");
            }}
            className='w-full flex justify-between text-left px-3 py-2.5 text-sm font-medium cursor-pointer hover:bg-black/5 rounded-md'
            style={{ color: "var(--color-danger)" }}>
            Logout
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-log-out-icon lucide-log-out'>
              <path d='m16 17 5-5-5-5' />
              <path d='M21 12H9' />
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className='w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5'
      style={{ color: "var(--color-text)" }}>
      {label}
    </button>
  );
}
