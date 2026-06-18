import { HeroQr } from "@/components/HeroQr";
import { LandingNav } from "@/components/LandingNav";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  Hash,
  QrCode,
  Route,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif-display",
});

const display = "font-[family-name:var(--font-serif-display)]";

export const metadata: Metadata = {
  title: "DeskRoute — Track physical files across offices with QR codes",
  description:
    "DeskRoute tracks physical files across multiple offices using QR codes. Follow every file desk to desk and branch to branch, with scan-to-track receipts, hand-writeable numbers, and a complete timestamped history.",
};

/* ── Hero docket: a stylized physical receipt with a real QR + IN TRANSIT stamp ── */
const ROUTE_STOPS = [
  { office: "Reception", time: "10:02", state: "done" as const },
  { office: "Records Dept", time: "10:41", state: "done" as const },
  { office: "Verification", time: "now", state: "current" as const },
  { office: "Approval", time: "—", state: "todo" as const },
];

function HeroDocket() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* IN TRANSIT stamp */}
      <div className="absolute -right-2 top-6 z-20 -rotate-12 sm:-right-5">
        <span
          className={cn(
            display,
            "block rounded-sm border-[3px] border-[#C0392B] px-3 py-1 text-xl font-bold uppercase tracking-wide text-[#C0392B] opacity-90 shadow-sm"
          )}>
          In transit
        </span>
      </div>

      <div className="rounded-lg border border-[#E0DBD0] bg-white shadow-[0_20px_50px_-20px_rgba(26,24,20,0.25)]">
        {/* perforated header */}
        <div className="flex items-center justify-between border-b border-dashed border-[#E0DBD0] px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6560]">
              Docket
            </p>
            <p className="font-mono text-3xl font-bold leading-none tracking-tight text-[#1A1814]">
              #0042
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6560]">
              Opened
            </p>
            <p className="font-mono text-sm text-[#1A1814]">12 Jun · 09:54</p>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-[#1A1814]">Property Transfer — Plot 14</p>
          <p className="text-xs text-[#6B6560]">Legal · Priority: Normal</p>

          {/* route */}
          <div className="mt-5">
            {ROUTE_STOPS.map((stop, i) => {
              const last = i === ROUTE_STOPS.length - 1;
              return (
                <div key={stop.office} className="relative flex items-center gap-3 pb-4 last:pb-0">
                  {!last && (
                    <span
                      className={cn(
                        "absolute left-[9px] top-5 h-[calc(100%-8px)] w-px",
                        stop.state === "done"
                          ? "bg-[#1A1814]"
                          : "border-l border-dashed border-[#E0DBD0]"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "z-10 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2",
                      stop.state === "done" && "border-[#1A1814] bg-[#1A1814] text-white",
                      stop.state === "current" && "border-[#C0392B] bg-[#C0392B]/10",
                      stop.state === "todo" && "border-[#E0DBD0] bg-white"
                    )}>
                    {stop.state === "done" && <Check className="size-2.5" strokeWidth={3.5} />}
                    {stop.state === "current" && (
                      <span className="size-1.5 rounded-full bg-[#C0392B]" />
                    )}
                  </span>
                  <div className="flex flex-1 items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        stop.state === "todo" ? "text-[#6B6560]" : "font-medium text-[#1A1814]"
                      )}>
                      {stop.office}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B6560]">{stop.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QR footer */}
        <div className="flex items-center gap-3 border-t border-dashed border-[#E0DBD0] bg-[#F7F4EE] px-5 py-4">
          <HeroQr className="size-14 shrink-0 border border-[#E0DBD0]" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1A1814]">Scan to track</p>
            <p className="font-mono text-[11px] text-[#6B6560]">deskroute.app/t/DR-0042</p>
          </div>
        </div>
      </div>

      {/* floating office chip */}
      <div className="absolute -left-3 bottom-20 hidden items-center gap-2 rounded-md border border-[#E0DBD0] bg-white px-3 py-2 shadow-sm sm:flex">
        <Building2 className="size-4 text-[#C0392B]" />
        <span className="text-xs font-medium text-[#1A1814]">4 offices</span>
      </div>
    </div>
  );
}

/* ── Extracted building blocks ── */
function StepCard({
  num,
  title,
  description,
  children,
}: {
  num: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <p className="font-mono text-sm font-medium text-[#C0392B]">{num}</p>
      <h3 className={cn(display, "mt-1 text-2xl text-[#1A1814]")}>{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#6B6560]">{description}</p>
      <div className="mt-5 rounded-lg border border-[#E0DBD0] bg-white p-4 shadow-sm">{children}</div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-2 text-center">
      <p className={cn(display, "text-4xl text-[#1A1814] sm:text-5xl")}>{value}</p>
      <p className="mt-1 text-xs font-medium text-[#6B6560] sm:text-sm">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Route;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-[#E0DBD0] bg-white p-5 sm:p-6">
      <span className="flex size-9 items-center justify-center rounded-md bg-[#F7F4EE] text-[#1A1814]">
        <Icon className="size-4.5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-[#1A1814]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#6B6560]">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-[#E0DBD0] py-4 [&_summary]:cursor-pointer">
      <summary className="flex items-center justify-between gap-4 text-base font-medium text-[#1A1814] marker:content-['']">
        {q}
        <ChevronDown className="size-4 shrink-0 text-[#6B6560] transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-[#6B6560]">{a}</p>
    </details>
  );
}

/* ── Mini illustrations (pure HTML+CSS) ── */
function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#6B6560]">{label}</p>
      <div className="rounded-md border border-[#E0DBD0] bg-[#F7F4EE] px-2.5 py-1.5 text-xs text-[#1A1814]">
        {value}
      </div>
    </div>
  );
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-[#C0392B]/10 text-[#C0392B]" : "bg-[#F7F4EE] text-[#6B6560]"
      )}>
      {children}
    </span>
  );
}

const FAQS = [
  {
    q: "Do we need special hardware or scanners?",
    a: "No. Any phone camera scans the QR receipt, and every file also gets a short number anyone can write down by hand — so the system works even when a device isn't around.",
  },
  {
    q: "Can we track files across multiple offices and branches?",
    a: "Yes — that's the core of DeskRoute. Each hand-off between offices is logged with a timestamp, so you always know which desk a file is on and how it got there.",
  },
  {
    q: "How do file numbers work?",
    a: "Every file gets a short, sequential number that's unique within your organization — never duplicated, easy to read aloud or jot on paper.",
  },
  {
    q: "Is it secure and role-based?",
    a: "Yes. Scope staff to their own branch or grant fine-grained, organization-wide permissions. Every action is recorded in an audit trail.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. You can create your organization and start tracking files for free — no credit card required. Upgrade only when your team grows.",
  },
];

export default function Home() {
  return (
    <div className={cn(serif.variable, "min-h-screen scroll-smooth bg-[#F7F4EE] text-[#1A1814]")}>
      <LandingNav />

      <main>
        {/* ── Hero ── */}
        <section className="border-b border-[#E0DBD0]">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6B6560]">
                Physical file tracking — QR-powered
              </p>
              <h1 className={cn(display, "mt-5 text-5xl leading-[1.02] text-[#1A1814] sm:text-6xl lg:text-7xl")}>
                Every file. Every desk.
                <span className="block italic">Every hand-off.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#6B6560]">
                Track physical files across multiple offices using QR codes — desk to desk, branch
                to branch, with a complete, timestamped history of every hand-off.
              </p>

              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-md bg-[#C0392B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
                  Start tracking free
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A1814] transition-colors hover:text-[#C0392B]">
                  See how it works
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>

            <div className="lg:pl-6">
              <HeroDocket />
            </div>
          </div>

          {/* Trust strip — the single industry mention */}
          <div id="use-cases" className="border-t border-[#E0DBD0] bg-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-5 sm:flex-row sm:justify-center sm:gap-2 sm:px-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6560]">
                Trusted by teams in:
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1A1814]">
                Healthcare · Government · Legal · Finance · Education
              </span>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="border-b border-[#E0DBD0]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
            <h2 className={cn(display, "text-4xl text-[#1A1814] sm:text-5xl")}>
              Three moves. Full trail.
            </h2>
            <p className="mt-3 max-w-xl text-[#6B6560]">
              From intake to insight — no training required, no scanners to buy.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
              <StepCard
                num="01"
                title="Log the file"
                description="Capture a subject, category and starting office. A unique number is assigned the instant you save.">
                <div className="space-y-3">
                  <MiniField label="Subject" value="Property Transfer — Plot 14" />
                  <MiniField label="Category" value="Legal" />
                  <MiniField label="Office" value="Reception" />
                </div>
              </StepCard>

              <StepCard
                num="02"
                title="Route it onward"
                description="As the file changes hands, update its location and status in a couple of taps.">
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#6B6560]">
                      Move to
                    </p>
                    <div className="flex items-center justify-between rounded-md border border-[#E0DBD0] bg-[#F7F4EE] px-2.5 py-1.5 text-xs text-[#1A1814]">
                      Records Dept
                      <ChevronDown className="size-3.5 text-[#6B6560]" />
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[#6B6560]">
                      Status
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Pill>Received</Pill>
                      <Pill active>In review</Pill>
                      <Pill>Verified</Pill>
                    </div>
                  </div>
                </div>
              </StepCard>

              <StepCard
                num="03"
                title="Read the trail"
                description="Every hand-off is recorded with a timestamp, so the full journey is one search away.">
                <ul className="space-y-2.5">
                  {[
                    { o: "Reception", t: "10:02" },
                    { o: "Records Dept", t: "10:41" },
                    { o: "Verification", t: "11:15" },
                    { o: "Approval", t: "—" },
                  ].map((e) => (
                    <li key={e.o} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-[#1A1814]">
                        <span className="size-1.5 rounded-full bg-[#1A1814]" />
                        {e.o}
                      </span>
                      <span className="font-mono text-[#6B6560]">{e.t}</span>
                    </li>
                  ))}
                </ul>
              </StepCard>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="border-b border-[#E0DBD0] bg-[#EEE9DF]">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
            <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
              <StatItem value="100%" label="Files accounted for" />
              <StatItem value="3 taps" label="Per hand-off" />
              <StatItem value="0" label="Scanners required" />
              <StatItem value="∞" label="Offices & branches" />
            </div>
            <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-[#6B6560]">
              Across organizations in early access.
            </p>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="border-b border-[#E0DBD0]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
            <h2 className={cn(display, "max-w-2xl text-4xl text-[#1A1814] sm:text-5xl")}>
              Built for the way paper actually moves
            </h2>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <FeatureCard
                icon={Route}
                title="Follow every hand-off"
                description="Watch a file move between offices in real time — never wonder whose desk it's on.">
                <div className="flex items-center">
                  {["Reception", "Records", "Approval"].map((o, i, arr) => (
                    <div key={o} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={cn(
                            "size-2.5 rounded-full",
                            i <= 1 ? "bg-[#1A1814]" : "border-2 border-[#E0DBD0] bg-white"
                          )}
                        />
                        <span className="font-mono text-[10px] text-[#6B6560]">{o}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <span
                          className={cn(
                            "mx-1 mb-4 h-px flex-1",
                            i < 1 ? "bg-[#1A1814]" : "border-t border-dashed border-[#E0DBD0]"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </FeatureCard>

              <FeatureCard
                icon={Hash}
                title="Hand-writeable numbers"
                description="Short, sequential per organization — never duplicated, easy to read aloud or jot down.">
                <p className="font-mono text-5xl font-bold tracking-tight text-[#1A1814]">#0042</p>
              </FeatureCard>

              <FeatureCard
                icon={QrCode}
                title="Scan-to-track receipts"
                description="Print a real QR receipt so anyone can check a file's live status from any phone.">
                <div className="flex items-center gap-3 rounded-md border border-[#E0DBD0] bg-[#F7F4EE] p-3">
                  <HeroQr className="size-12 shrink-0 border border-[#E0DBD0]" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1814]">File #0042</p>
                    <p className="font-mono text-[10px] text-[#6B6560]">deskroute.app/t/DR-0042</p>
                  </div>
                </div>
              </FeatureCard>

              <FeatureCard
                icon={Workflow}
                title="Custom status workflows"
                description="Define the stages your process needs and move files through them in order.">
                <div className="flex flex-wrap items-center gap-1.5">
                  {["Received", "In review", "Verified", "Approved"].map((s, i, arr) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <Pill active={i === 2}>{s}</Pill>
                      {i < arr.length - 1 && <ArrowRight className="size-3 text-[#6B6560]" />}
                    </span>
                  ))}
                </div>
              </FeatureCard>

              <FeatureCard
                icon={ShieldCheck}
                title="Roles & permissions"
                description="Scope staff to their own branch, or grant fine-grained organization-wide rights.">
                <div className="overflow-hidden rounded-md border border-[#E0DBD0]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F7F4EE] text-[#6B6560]">
                        <th className="px-2.5 py-1.5 font-medium">Role</th>
                        <th className="px-2.5 py-1.5 text-center font-medium">View</th>
                        <th className="px-2.5 py-1.5 text-center font-medium">Edit</th>
                        <th className="px-2.5 py-1.5 text-center font-medium">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#1A1814]">
                      {[
                        { r: "Owner", v: true, e: true, a: true },
                        { r: "Manager", v: true, e: true, a: false },
                        { r: "Staff", v: true, e: false, a: false },
                      ].map((row) => (
                        <tr key={row.r} className="border-t border-[#E0DBD0]">
                          <td className="px-2.5 py-1.5 font-medium">{row.r}</td>
                          {[row.v, row.e, row.a].map((on, i) => (
                            <td key={i} className="px-2.5 py-1.5 text-center">
                              {on ? (
                                <Check className="mx-auto size-3.5 text-[#C0392B]" strokeWidth={3} />
                              ) : (
                                <span className="text-[#E0DBD0]">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FeatureCard>

              <FeatureCard
                icon={GitBranch}
                title="Multi-branch support"
                description="Run every office and branch from one workspace, with files routing between them.">
                <div className="text-xs">
                  <div className="inline-flex items-center gap-2 rounded-md border border-[#E0DBD0] bg-[#F7F4EE] px-2.5 py-1.5 font-medium text-[#1A1814]">
                    <Building2 className="size-3.5 text-[#C0392B]" />
                    Headquarters
                  </div>
                  <div className="ml-4 mt-2 space-y-2 border-l border-dashed border-[#E0DBD0] pl-4">
                    {["Branch A", "Branch B"].map((b) => (
                      <div
                        key={b}
                        className="inline-flex items-center gap-2 rounded-md border border-[#E0DBD0] bg-white px-2.5 py-1.5 text-[#1A1814]">
                        <Building2 className="size-3.5 text-[#6B6560]" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* ── Testimonial ── */}
        <section className="border-b border-[#E0DBD0] bg-[#EEE9DF]">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6">
            <p className={cn(display, "text-6xl leading-none text-[#C0392B]")}>“</p>
            <blockquote className={cn(display, "mt-2 text-2xl leading-snug text-[#1A1814] sm:text-3xl")}>
              We stopped losing files overnight. Anyone can scan the receipt and see exactly which
              office a file is in — no more walking floor to floor asking around.
            </blockquote>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-[#6B6560]">
              Priya Nair — Records Director, Regional Registry Office
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="border-b border-[#E0DBD0]">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
            <h2 className={cn(display, "text-4xl text-[#1A1814] sm:text-5xl")}>Questions, answered</h2>
            <div className="mt-10 border-t border-[#E0DBD0]">
              {FAQS.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="border-b border-[#E0DBD0]">
          <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6">
            <h2 className={cn(display, "text-5xl text-[#1A1814] sm:text-6xl")}>
              Stop hunting for files<span className="text-[#C0392B]">.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[#6B6560]">
              Create your organization in minutes — set up your offices, statuses and team, then
              track every file from intake to completion.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-md bg-[#C0392B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
                Get started free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-md px-6 py-3 text-sm font-semibold text-[#1A1814] transition-colors hover:text-[#C0392B]">
                Sign in
              </Link>
            </div>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6B6560]">
              No credit card required · Free plan available
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#1A1814]">
                  <FileText className="size-4 text-[#F7F4EE]" />
                </span>
                <span className="text-lg font-semibold tracking-tight text-[#1A1814]">DeskRoute</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-[#6B6560]">
                Track physical files across offices and branches using QR codes.
              </p>
            </div>

            {[
              {
                heading: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how" },
                  { label: "Use cases", href: "#use-cases" },
                ],
              },
              {
                heading: "Company",
                links: [
                  { label: "About", href: "#" },
                  { label: "Contact", href: "#" },
                ],
              },
              {
                heading: "Legal",
                links: [
                  { label: "Privacy", href: "#" },
                  { label: "Terms", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6B6560]">
                  {col.heading}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-[#1A1814] transition-colors hover:text-[#C0392B]">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#E0DBD0] pt-6 sm:flex-row">
            <p className="font-mono text-xs text-[#6B6560]">
              © {new Date().getFullYear()} DeskRoute
            </p>
            <p className="font-mono text-xs text-[#6B6560]">Made for teams that run on paper.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
