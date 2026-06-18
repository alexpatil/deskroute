import { Button } from "@/components/ui/button";
import { HeroQr } from "@/components/HeroQr";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  FilePlus2,
  History,
  QrCode,
  Route,
  ScanLine,
  ShieldCheck,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "DeskRoute — Track physical files across offices with QR codes",
  description:
    "DeskRoute tracks physical files across multiple offices using QR codes. Follow every file desk to desk with QR receipts, hand-writeable numbers, and a complete, timestamped history.",
};

/* Dotted-grid texture, faded toward the edges */
const dotGrid: React.CSSProperties = {
  backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* The signature hero visual: a file moving along its route */
const ROUTE_STOPS = [
  { office: "Reception", time: "10:02", state: "done" as const },
  { office: "Records Dept", time: "10:41", state: "done" as const },
  { office: "Verification", time: "now", state: "current" as const },
  { office: "Approval", time: "—", state: "todo" as const },
];

function TrackingCard() {
  return (
    <div className="relative">
      {/* depth card behind */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl border bg-card/60" />
      <div className="relative rounded-3xl border bg-card p-5 shadow-xl">
        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              File
            </p>
            <p className="font-mono text-3xl font-bold leading-none tracking-tight">#0042</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
            <span className="size-1.5 animate-pulse rounded-full bg-warning" />
            In transit
          </span>
        </div>

        <p className="mt-3 text-sm font-medium">Property Transfer — Plot 14</p>
        <p className="text-xs text-muted-foreground">Legal · opened 2 days ago</p>

        {/* route timeline */}
        <div className="mt-5 space-y-0">
          {ROUTE_STOPS.map((stop, i) => {
            const last = i === ROUTE_STOPS.length - 1;
            return (
              <div key={stop.office} className="relative flex items-center gap-3 pb-4 last:pb-0">
                {/* connector */}
                {!last && (
                  <span
                    className={cn(
                      "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                      stop.state === "done" ? "bg-primary" : "border-l border-dashed border-border"
                    )}
                  />
                )}
                {/* node */}
                <span
                  className={cn(
                    "z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                    stop.state === "done" && "border-primary bg-primary text-primary-foreground",
                    stop.state === "current" && "border-warning bg-warning/15",
                    stop.state === "todo" && "border-border bg-card"
                  )}>
                  {stop.state === "done" && <Check className="size-3.5" strokeWidth={3} />}
                  {stop.state === "current" && (
                    <span className="size-2 animate-pulse rounded-full bg-warning" />
                  )}
                </span>
                <div className="flex flex-1 items-center justify-between">
                  <span
                    className={cn(
                      "text-sm",
                      stop.state === "todo" ? "text-muted-foreground" : "font-medium"
                    )}>
                    {stop.office}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{stop.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* footer: scan strip with a real QR receipt */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl border bg-muted/40 p-3">
          <HeroQr className="size-14 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold">Printed on the receipt</p>
            <p className="text-[11px] text-muted-foreground">Scan to see this file's live status</p>
          </div>
          <ScanLine className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </div>
      </div>

      {/* floating office chip */}
      <div className="absolute -left-4 top-10 hidden rounded-xl border bg-card px-3 py-2 shadow-lg sm:flex sm:items-center sm:gap-2">
        <Building2 className="size-4 text-primary" />
        <span className="text-xs font-medium">4 offices</span>
      </div>

      {/* floating scan chip */}
      <div className="absolute -right-3 bottom-16 hidden rounded-xl border bg-card px-3 py-2 shadow-lg sm:flex sm:items-center sm:gap-2">
        <QrCode className="size-4 text-primary" />
        <span className="text-xs font-medium">Scan to track</span>
      </div>
    </div>
  );
}

/* ── Bento helpers ── */
const STATUSES = ["Received", "In review", "Verified", "Approved", "Dispatched"];

const TRUST_SECTORS = ["Healthcare", "Government", "Legal", "Finance", "Education", "Logistics"];

const STATS = [
  { value: "100%", label: "Files accounted for" },
  { value: "3 taps", label: "To route a hand-off" },
  { value: "0", label: "Scanners required" },
  { value: "∞", label: "Offices & branches" },
];

const FAQS = [
  {
    q: "Do we need special hardware or scanners?",
    a: "No. Any phone camera scans the QR receipt, and every file also gets a short number anyone can write down by hand — so the system works even when a device isn't around.",
  },
  {
    q: "Can we track files across multiple offices and branches?",
    a: "Yes. That's the core of DeskRoute. Each hand-off between offices is logged with a timestamp, so you always know which desk a file is on and how it got there.",
  },
  {
    q: "How do file numbers work?",
    a: "Every file gets a short, sequential number that's unique within your organization — never duplicated, easy to read aloud or jot on paper.",
  },
  {
    q: "Is it secure and role-based?",
    a: "Yes. Scope staff to their own branch or grant fine-grained, organization-wide permissions. Every action is recorded in an audit trail.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Route className="size-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">DeskRoute</span>
            <span className="hidden rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              v1.0
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#use-cases" className="transition-colors hover:text-foreground">Use cases</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <SiteThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            style={dotGrid}
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            {/* copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground shadow-xs">
                <span className="size-1.5 rounded-full bg-success" />
                QR-powered file tracking
              </div>

              <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Track physical files
                <span className="block text-primary">across every office.</span>
              </h1>

              <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
                DeskRoute follows your paper files desk to desk and branch to branch using QR
                codes — with scan-to-track receipts, numbers anyone can write by hand, and a
                complete, timestamped history.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-11 px-6">
                  <Link href="/register">
                    Start tracking free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-11 px-6">
                  <a href="#how">See how it works</a>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-5 font-mono text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-success" /> No lost files
                </span>
                <span className="h-3 w-px bg-border" />
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-success" /> Works without scanners
                </span>
                <span className="h-3 w-px bg-border" />
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-success" /> Free to start
                </span>
              </div>
            </div>

            {/* visual */}
            <div className="lg:pl-6">
              <TrackingCard />
            </div>
          </div>

          {/* trust band */}
          <div className="relative border-t bg-muted/30">
            <div className="mx-auto max-w-6xl px-6 py-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Trusted by file-heavy teams in
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-foreground/60">
                  {TRUST_SECTORS.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works (route line) ── */}
        <section id="how" className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-primary">The route</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  From intake to insight in three moves
                </h2>
              </div>
            </div>

            <div className="relative mt-14 grid gap-10 md:grid-cols-3">
              {/* dashed connecting line */}
              <div
                aria-hidden
                className="absolute left-0 right-0 top-5 hidden border-t border-dashed border-border md:block"
              />
              {[
                { icon: FilePlus2, t: "Create the file", d: "Log a subject, category, starting office and status. A unique number is assigned the instant you save." },
                { icon: Route, t: "Route it onward", d: "As the file changes hands between offices, update its location and status in a couple of taps." },
                { icon: History, t: "Read the trail", d: "Every hand-off is recorded with a timestamp, so the full journey is always one search away." },
              ].map(({ icon: Icon, t, d }, i) => (
                <div key={t} className="relative">
                  <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 font-mono text-xs text-muted-foreground">0{i + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features bento ── */}
        <section id="features" className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">Features</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for the way paper actually moves
              </h2>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Live route — wide */}
              <div className="flex flex-col justify-between rounded-2xl border bg-card p-6 md:col-span-2">
                <div>
                  <h3 className="text-base font-semibold">Follow every hand-off</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Watch a file move between offices in real time — never wonder whose desk it's on.
                  </p>
                </div>
                {/* mini horizontal route */}
                <div className="mt-6 flex items-center">
                  {["Reception", "Records", "Approval"].map((o, i, arr) => (
                    <div key={o} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={cn(
                            "flex size-3 items-center justify-center rounded-full",
                            i <= 1 ? "bg-primary" : "border-2 border-border bg-card"
                          )}
                        />
                        <span className="font-mono text-[10px] text-muted-foreground">{o}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <span
                          className={cn(
                            "mx-1 mb-4 h-px flex-1",
                            i < 1 ? "bg-primary" : "border-t border-dashed border-border"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* File number */}
              <div className="rounded-2xl border bg-card p-6">
                <p className="font-mono text-4xl font-bold tracking-tight text-primary">#0042</p>
                <h3 className="mt-4 text-base font-semibold">Hand-writeable numbers</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Short, sequential per organization — never duplicated, easy to jot down.
                </p>
              </div>

              {/* QR — real, scannable */}
              <div className="flex flex-col rounded-2xl border bg-card p-6">
                <HeroQr className="size-16" />
                <h3 className="mt-4 text-base font-semibold">Scan-to-track receipts</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Print a real QR receipt so anyone can check a file's live status.
                </p>
              </div>

              {/* Statuses */}
              <div className="rounded-2xl border bg-card p-6">
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s, i) => (
                    <span
                      key={s}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        i === 2
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                      {s}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 text-base font-semibold">Custom status workflows</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Define the stages your process needs and move files through them.
                </p>
              </div>

              {/* Permissions — wide */}
              <div className="flex flex-col justify-between rounded-2xl border bg-card p-6 md:col-span-2">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    <h3 className="text-base font-semibold">Roles &amp; permissions</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Scope staff to their own branch, or grant fine-grained organization-wide rights.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <div className="flex -space-x-2">
                    {["A", "M", "S", "R"].map((c, i) => (
                      <span
                        key={c}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full border-2 border-card text-[11px] font-semibold text-primary-foreground",
                          ["bg-primary", "bg-success", "bg-warning", "bg-info"][i]
                        )}>
                        {c}
                      </span>
                    ))}
                  </div>
                  {["View all files", "Manage branches", "Configure statuses"].map((p) => (
                    <span
                      key={p}
                      className="rounded-md border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats / proof ── */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden border-x bg-border md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-background px-6 py-10 text-center">
                <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{s.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonial ── */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <div className="flex justify-center gap-0.5 text-warning">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-6 text-balance text-xl font-medium leading-relaxed sm:text-2xl">
              “We stopped losing files overnight. Anyone can scan the receipt and see exactly which
              office a file is in — no more walking floor to floor asking around.”
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                RD
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold">Records Director</p>
                <p className="text-xs text-muted-foreground">Regional Registry Office</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Use cases ── */}
        <section id="use-cases" className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Any organization that moves paper between desks runs on DeskRoute
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-sm font-medium text-foreground/70">
              {["Healthcare", "Education", "Government", "Legal", "Finance", "Insurance", "Logistics"].map(
                (label, i, arr) => (
                  <span key={label} className="flex items-center gap-6">
                    {label}
                    {i < arr.length - 1 && <span className="size-1 rounded-full bg-border" />}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="border-b bg-muted/30">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">FAQ</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Questions, answered
              </h2>
            </div>
            <div className="mt-12 space-y-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border bg-card p-5 [&_summary]:cursor-pointer">
                  <summary className="flex items-center justify-between gap-4 text-base font-semibold marker:content-['']">
                    {f.q}
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            style={dotGrid}
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_50%_60%_at_50%_50%,black,transparent)]"
          />
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
              Stop hunting for files.
              <br />
              Start following them.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-balance text-muted-foreground">
              Create your organization in minutes — set up your offices, statuses and team, then
              track every file from intake to completion.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-7 text-base">
                <Link href="/register">
                  Get started free
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="mt-5 font-mono text-xs text-muted-foreground">
              No credit card required · Free plan available
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <Route className="size-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">DeskRoute</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} DeskRoute · Track physical files with QR codes
          </p>
          <Link
            href="/login"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Sign in →
          </Link>
        </div>
      </footer>
    </div>
  );
}
