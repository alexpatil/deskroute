"use client";

import { Input } from "@/components/ui/input";
import type { File } from "@/features/files/file.types";
import { formatFileNumber, matchesFileNumber } from "@/features/files/file.utils";
import { authClient } from "@/lib/auth-client";
import { httpService } from "@/lib/httpService";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronLeft,
  FileText,
  LogOut,
  type LucideIcon,
  Plus,
  Search,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ShellUser {
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isOwner: boolean;
  canManageLocations: boolean;
  canConfigureStatuses: boolean;
  canManageStaff: boolean;
}

/** Prefer a real name (first/last, then full name), falling back to the email. */
function displayNameOf(user: ShellUser | null): string {
  const full = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user?.name?.trim()) return user.name.trim();
  return user?.email?.split("@")[0] ?? "User";
}

function initialsOf(user: ShellUser | null): string {
  const f = user?.firstName?.[0];
  const l = user?.lastName?.[0];
  if (f || l) return `${f ?? ""}${l ?? ""}`.toUpperCase();
  const name = displayNameOf(user);
  return name[0]?.toUpperCase() ?? "?";
}
interface AppShellProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
  backHref?: string;
}

type NavPerm = "canManageLocations" | "canConfigureStatuses" | "canManageStaff";
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  always?: boolean;
  perm?: NavPerm;
  ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Files", icon: FileText, always: true },
  { href: "/locations", label: "Offices", icon: Building2, perm: "canManageLocations" },
  { href: "/staff", label: "Team", icon: Users, perm: "canManageStaff" },
  { href: "/file-statuses", label: "Statuses", icon: Tags, perm: "canConfigureStatuses" },
  { href: "/settings", label: "Settings", icon: Settings, ownerOnly: true },
];

function useNavItems(user: ShellUser | null) {
  return NAV_ITEMS.filter((item) => {
    if (item.always) return true;
    if (!user) return false;
    if (item.ownerOnly) return user.isOwner;
    if (!item.perm) return false;
    return user.isOwner || user[item.perm];
  });
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ─── Sidebar (desktop) ──────────────────────────────────────────────────── */
function Sidebar({ user }: { user: ShellUser | null }) {
  const pathname = usePathname();
  const items = useNavItems(user);
  const initials = initialsOf(user);
  const displayName = displayNameOf(user);
  const role = user?.isOwner ? "Owner" : "Staff";

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full flex-col bg-[#1A1814] text-white">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-7 items-center justify-center rounded-md bg-[#C0392B]">
          <FileText className="size-4 text-white" />
        </span>
        <span className="font-serif text-2xl leading-none">DeskRoute</span>
      </Link>

      {/* Nav */}
      <nav className="mt-2 flex-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 border-l-[3px] px-5 text-sm transition-colors",
                active
                  ? "border-[#C0392B] bg-[#2A2620] font-medium text-white"
                  : "border-transparent text-white/70 hover:bg-[#2A2620] hover:text-white",
              )}>
              <Icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-[#2A2620] p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#C0392B] text-sm font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium capitalize text-white">{displayName}</p>
            <p className="truncate text-xs text-white/60">{role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white/70 transition-colors hover:bg-[#2A2620] hover:text-white">
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ─── Mobile bottom tab bar ──────────────────────────────────────────────── */
function MobileTabBar({ user }: { user: ShellUser | null }) {
  const pathname = usePathname();
  const items = useNavItems(user);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[#E0DBD0] bg-white lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 items-center justify-center">
            <span
              className={cn(
                "flex items-center justify-center rounded-xl transition-all",
                active
                  ? "size-12 border-2 border-[#C0392B] bg-[#C0392B]/5 text-[#C0392B]"
                  : "size-10 text-[#6B6560]",
              )}>
              <Icon className={active ? "size-6" : "size-5"} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Header search ──────────────────────────────────────────────────────── */
function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const ensureLoaded = async () => {
    if (loaded) return;
    try {
      setFiles(await httpService.get<File[]>("/api/files"));
    } catch {
      /* ignore */
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const ql = q.trim().toLowerCase();
  const results = ql
    ? files
        .filter(
          (f) =>
            matchesFileNumber(f, q) ||
            f.subjectName.toLowerCase().includes(ql) ||
            f.category.toLowerCase().includes(ql) ||
            f.currentStatus.name.toLowerCase().includes(ql) ||
            f.currentLocation.name.toLowerCase().includes(ql),
        )
        .slice(0, 8)
    : [];

  const go = (id: string) => {
    setOpen(false);
    setQ("");
    router.push(`/files/${id}`);
  };

  return (
    <div ref={wrapRef} className="relative hidden max-w-xs flex-1 md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B6560]" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            void ensureLoaded();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].id);
            else if (e.key === "Escape") setOpen(false);
          }}
          aria-label="Search files"
          placeholder="Search files…"
          className="h-9 pl-9"
        />
      </div>

      {open && ql && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-[#E0DBD0] bg-white shadow-md">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[#6B6560]">
              {loaded ? "No files found" : "Searching…"}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1">
              {results.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => go(f.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[#F7F4EE]">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        f.isCompleted ? "bg-[#27AE60]" : "bg-[#E67E22]",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1A1814]">{f.subjectName}</p>
                      <p className="truncate text-xs text-[#6B6560]">
                        <span className="font-mono">{formatFileNumber(f)}</span> · {f.category}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── AppShell ───────────────────────────────────────────────────────────── */
export function AppShell({ children, title, actions, backHref }: AppShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<ShellUser | null>(null);

  useEffect(() => {
    httpService
      .get<ShellUser>("/api/auth/me")
      .then(setUser)
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EE] text-[#1A1814]">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <Sidebar user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[#E0DBD0] bg-white px-4 sm:px-6">
          {backHref ? (
            <button
              onClick={() => router.push(backHref)}
              aria-label="Back"
              className="-ml-1 flex size-8 items-center justify-center rounded-md text-[#6B6560] transition-colors hover:bg-[#F7F4EE] hover:text-[#1A1814]">
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <span className="font-serif text-xl leading-none text-[#1A1814] lg:hidden">DeskRoute</span>
          )}
          <span className="truncate text-sm text-[#6B6560]">{title}</span>

          <div className="ml-auto flex items-center gap-2">
            {actions}
            <HeaderSearch />
            <Link
              href="/files/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#C0392B] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New File</span>
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-[#F7F4EE] pb-20 lg:pb-0">{children}</main>
      </div>

      <MobileTabBar user={user} />
    </div>
  );
}
