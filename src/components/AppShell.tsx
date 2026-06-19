"use client";

import { TrialBanner } from "@/components/TrialBanner";
import { Input } from "@/components/ui/input";
import type { File } from "@/features/files/file.types";
import { formatFileNumber, matchesFileNumber } from "@/features/files/file.utils";
import { authClient } from "@/lib/auth-client";
import { httpService } from "@/lib/httpService";
import type { TrialStatus } from "@/lib/trial";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronLeft,
  FileText,
  LogOut,
  type LucideIcon,
  Plus,
  Route,
  Search,
  Settings,
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
  hasOrganization?: boolean;
  bypassTrial?: boolean;
  trial?: TrialStatus;
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

// AppShell is mounted per-page, so without this each navigation would re-fetch
// /api/auth/me and flash the sidebar name/role back to empty. Caching the last
// result at module scope lets remounts paint instantly while still revalidating.
let cachedUser: ShellUser | null = null;
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
  { href: "/locations", label: "Locations", icon: Building2, perm: "canManageLocations" },
  // Staff management is owner-only on the API (requireOwner), so gate the nav
  // the same way instead of by canManageStaff (which the API never honors).
  { href: "/staff", label: "Team", icon: Users, ownerOnly: true },
  // Statuses lives under Settings → Statuses (keeps the nav balanced around the
  // centered "New File" action on mobile).
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

// Root navigation pages never show the topbar back arrow.
const ROOT_NAV_PATHS = ["/dashboard", "/locations", "/staff", "/settings"];

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
          <Route className="size-4 text-white" />
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
      <div className="flex items-center gap-3 border-t border-[#2A2620] p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C0392B] text-sm font-semibold text-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium capitalize text-white">{displayName}</p>
          <p className="truncate text-xs text-white/60">{role}</p>
        </div>
        <button
          onClick={signOut}
          title="Sign out"
          aria-label="Sign out"
          className="shrink-0 cursor-pointer text-[#6B6560] transition-colors hover:text-[#C0392B]">
          <LogOut className="size-4.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Mobile bottom tab bar ──────────────────────────────────────────────── */
function MobileTabBar({ user }: { user: ShellUser | null }) {
  const pathname = usePathname();
  const items = useNavItems(user);
  const mid = Math.ceil(items.length / 2);
  const left = items.slice(0, mid);
  const right = items.slice(mid);

  const renderTab = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center justify-end gap-1 py-1",
          active ? "text-[#C0392B]" : "text-[#6B6560]",
        )}>
        <Icon className="size-5.5" />
        <span className="text-[11px] font-medium leading-none">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="relative mx-4 mb-4 flex items-end rounded-2xl border border-[#E0DBD0] bg-white px-2 pb-2 pt-3 shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
        {/* Left tab group */}
        <div className="flex flex-1 justify-around">{left.map(renderTab)}</div>

        {/* Reserved gap for the centered action button */}
        <div className="w-16 shrink-0" aria-hidden />

        {/* Right tab group */}
        <div className="flex flex-1 justify-around">{right.map(renderTab)}</div>

        {/* Elevated primary action — always horizontally centered */}
        <Link
          href="/files/new"
          aria-label="New file"
          className="absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-5 items-center justify-center rounded-full bg-[#C0392B] text-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] ring-4 ring-white transition-colors hover:bg-[#a83324]">
          <Plus className="size-6" />
        </Link>
      </div>
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
  const pathname = usePathname();
  const [user, setUser] = useState<ShellUser | null>(cachedUser);

  useEffect(() => {
    httpService
      .get<ShellUser>("/api/auth/me")
      .then((u) => {
        cachedUser = u;
        setUser(u);
        // Expired trial → send the user to the upgrade wall (org members only;
        // owners with bypass and system admins are exempt).
        if (u.hasOrganization && !u.bypassTrial && u.trial?.expired) {
          router.replace("/trial-expired");
        }
      })
      .catch(() => {});
  }, [router]);

  const showTrialBanner = !!user?.hasOrganization && !user.bypassTrial && !!user.trial?.active;
  // Show the back arrow only on child pages (not the root nav destinations).
  const showBack = !!backHref && !ROOT_NAV_PATHS.includes(pathname);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F7F4EE] text-[#1A1814]">
      {/* Trial banner — full width, pushes the rest of the shell down */}
      {showTrialBanner && <TrialBanner daysLeft={user!.trial!.daysLeft} />}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <Sidebar user={user} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[#E0DBD0] bg-white px-4 sm:px-6">
          {showBack ? (
            <button
              onClick={() => router.push(backHref!)}
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
          <main className="flex-1 overflow-y-auto bg-[#F7F4EE] pb-24 lg:pb-0">{children}</main>
        </div>
      </div>

      <MobileTabBar user={user} />
    </div>
  );
}
