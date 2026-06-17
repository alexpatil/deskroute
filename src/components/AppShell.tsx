"use client";

import { authClient } from "@/lib/auth-client";
import type { File } from "@/features/files/file.types";
import { formatFileNumber, matchesFileNumber } from "@/features/files/file.utils";
import { httpService } from "@/lib/httpService";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "./ThemeProvider";
import {
  Bell,
  Building2,
  ChevronLeft,
  FilePlus2,
  LayoutGrid,
  LogOut,
  type LucideIcon,
  Menu as MenuIcon,
  Moon,
  Route,
  Search,
  Sun,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ShellUser {
  email: string;
  isOwner: boolean;
  canManageLocations: boolean;
  canConfigureStatuses: boolean;
  canManageStaff: boolean;
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
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, always: true },
  { href: "/files/new", label: "New File", icon: FilePlus2, always: true },
  { href: "/locations", label: "Offices", icon: Building2, perm: "canManageLocations" },
  { href: "/file-statuses", label: "Statuses", icon: Tags, perm: "canConfigureStatuses" },
  { href: "/staff", label: "Employees", icon: Users, perm: "canManageStaff" },
];

/* ─── Theme toggle ───────────────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme">
          <Sun className="size-4.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{theme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  );
}

/* ─── User menu ──────────────────────────────────────────────────────────── */
function UserMenu({ user }: { user: ShellUser | null }) {
  const initials = user?.email?.[0]?.toUpperCase() ?? "?";
  const displayName = user?.email?.split("@")[0] ?? "User";
  const role = user?.isOwner ? "Super Admin" : "Staff";

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-0.5 pr-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-[13px] font-medium capitalize leading-tight">{displayName}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{role}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{user?.email ?? "—"}</span>
          <span className="text-xs font-normal text-muted-foreground">{role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Sidebar nav ────────────────────────────────────────────────────────── */
function SidebarNav({
  user,
  collapsed,
  onNavigate,
}: {
  user: ShellUser | null;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => {
    if (item.always) return true;
    if (!item.perm || !user) return false;
    return user.isOwner || user[item.perm];
  });

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href === "/dashboard" && pathname === "/");

          const link = (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );

          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.href}>{link}</div>
          );
        })}
      </nav>

      {/* Pro plan card */}
      {!collapsed && (
        <div className="p-3">
          <div className="rounded-xl border bg-linear-to-br from-primary/10 to-card p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold">Pro Plan</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Active
              </span>
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">Valid till 12 Dec 2025</p>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "78%" }} />
            </div>
            <Button size="sm" className="w-full">
              Upgrade Plan
            </Button>
          </div>
        </div>
      )}
    </div>
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
        void ensureLoaded();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Close on outside click
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
            f.currentLocation.name.toLowerCase().includes(ql)
        )
        .slice(0, 8)
    : [];

  const go = (id: string) => {
    setOpen(false);
    setQ("");
    router.push(`/files/${id}`);
  };

  return (
    <div ref={wrapRef} className="relative hidden max-w-md flex-1 md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
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
          placeholder="Search files by number, subject…"
          className="h-9 pl-9"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      {open && ql && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border bg-popover shadow-lg animate-fade-in">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {loaded ? "No files found" : "Searching…"}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1">
              {results.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => go(f.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        f.isCompleted ? "bg-success" : "bg-warning"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{f.subjectName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="font-mono">{formatFileNumber(f)}</span> · {f.category}
                      </p>
                    </div>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {f.currentLocation.name}
                    </span>
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    httpService.get<ShellUser>("/api/auth/me").then(setUser).catch(() => {});
  }, []);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Top bar ── */}
      <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-card px-3">
        {/* Brand + toggle */}
        <div
          className="flex shrink-0 items-center gap-2 overflow-hidden transition-all duration-200"
          style={{ width: sidebarWidth - 12 }}>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar">
            <MenuIcon className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu">
            <MenuIcon className="size-5" />
          </Button>
          {!collapsed && (
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Route className="size-4 text-primary-foreground" />
              </div>
              <span className="truncate text-[15px] font-bold tracking-tight">DeskRoute</span>
            </Link>
          )}
        </div>

        {/* Search */}
        <HeaderSearch />

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1">
          {actions && (
            <>
              <div className="mr-1 flex items-center gap-1.5">{actions}</div>
              <Separator orientation="vertical" className="mx-1 h-5!" />
            </>
          )}

          <ThemeToggle />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="size-4.5" />
                <span className="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  12
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-5!" />
          <UserMenu user={user} />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className="hidden shrink-0 overflow-hidden border-r transition-all duration-200 ease-out lg:block"
          style={{ width: sidebarWidth }}>
          <SidebarNav user={user} collapsed={collapsed} />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="relative z-10 w-64 border-r">
              <SidebarNav user={user} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Page */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {backHref && (
            <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-card px-4">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => router.push(backHref)}
                aria-label="Back">
                <ChevronLeft className="size-4" />
              </Button>
              <h1 className="text-sm font-semibold">{title}</h1>
            </div>
          )}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
