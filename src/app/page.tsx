import { Button } from "@/components/ui/button";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FilePlus2,
  Hash,
  History,
  MapPin,
  QrCode,
  Route,
  ShieldCheck,
  Tags,
} from "lucide-react";

export const metadata: Metadata = {
  title: "DeskRoute — Track every file, across every office",
  description:
    "DeskRoute is a universal file tracking platform. Follow physical files as they move between branches, with QR receipts, hand-writeable file numbers, status workflows, and a full audit trail.",
};

const FEATURES = [
  {
    icon: MapPin,
    title: "Track every file",
    desc: "Always know exactly which office or desk a file is sitting on, in real time.",
  },
  {
    icon: Building2,
    title: "Multi-branch ready",
    desc: "Model branches, offices, warehouses, departments or counters — however you operate.",
  },
  {
    icon: Tags,
    title: "Custom status workflows",
    desc: "Define the statuses your process needs and move files through them with one tap.",
  },
  {
    icon: QrCode,
    title: "QR receipts & printing",
    desc: "Print a receipt with a QR code so anyone can scan to see a file's live status.",
  },
  {
    icon: Hash,
    title: "Hand-writeable numbers",
    desc: "Every file gets a short, sequential number that's easy to write where QR isn't printed.",
  },
  {
    icon: ShieldCheck,
    title: "Roles & permissions",
    desc: "Give staff access to their own branch, or grant fine-grained organization-wide rights.",
  },
];

const STEPS = [
  {
    icon: FilePlus2,
    title: "Create a file",
    desc: "Add a subject, category, starting office and status. A unique number is assigned instantly.",
  },
  {
    icon: Route,
    title: "Move it along",
    desc: "As the file travels between offices, update its location and status in seconds.",
  },
  {
    icon: History,
    title: "Track the history",
    desc: "Every move is recorded, so you get a complete, timestamped trail for each file.",
  },
];

const USE_CASES = [
  "Healthcare",
  "Education",
  "Government",
  "Legal",
  "Finance",
  "Real Estate",
  "Insurance",
  "Logistics",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Route className="size-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">DeskRoute</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#use-cases" className="transition-colors hover:text-foreground">Use cases</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <SiteThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* soft background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-105 max-w-4xl rounded-full bg-primary/15 blur-3xl"
          />
          <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <span className="flex size-1.5 rounded-full bg-success" />
              Universal file tracking platform
            </div>

            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Track every file, across every office.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              DeskRoute follows your physical files as they move between branches — with QR
              receipts, hand-writeable numbers, custom status workflows, and a complete audit
              trail. No more lost paperwork.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-11 px-6">
                <Link href="/login">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-11 px-6">
                <a href="#how">See how it works</a>
              </Button>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-success" />
              Built for clinics, schools, government offices, law firms and more
            </p>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to keep files moving
              </h2>
              <p className="mt-4 text-muted-foreground">
                Purpose-built for organizations that still run on paper — without the chaos.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mt-4 text-muted-foreground">Three steps from intake to insight.</p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Use cases ── */}
        <section id="use-cases" className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted across industries
            </h2>
            <p className="mt-4 text-muted-foreground">
              Any organization that moves paper between desks can run on DeskRoute.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-2.5">
              {USE_CASES.map((label) => (
                <span
                  key={label}
                  className="rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-xs">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="relative overflow-hidden rounded-3xl border bg-primary px-8 py-16 text-center text-primary-foreground">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-2xl"
              />
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to stop losing files?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-balance text-primary-foreground/80">
                Set up your offices, statuses and team in minutes — then track every file from
                intake to completion.
              </p>
              <div className="mt-8 flex justify-center">
                <Button size="lg" variant="secondary" asChild className="h-11 px-6">
                  <Link href="/login">
                    Get started free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DeskRoute · Universal file tracking
          </p>
          <Link href="/login" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Sign in →
          </Link>
        </div>
      </footer>
    </div>
  );
}
