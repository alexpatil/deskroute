"use client";

import { LandingNav } from "@/components/LandingNav";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const display = "font-serif";

type Plan = {
  name: string;
  monthly: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthly: 999,
    tagline: "For a single office getting organized.",
    features: [
      "Unlimited files",
      "Up to 5 offices",
      "Custom status workflows",
      "Role-based access",
      "Email support",
    ],
  },
  {
    name: "Growth",
    monthly: 2999,
    tagline: "For multi-branch operations.",
    features: [
      "Everything in Starter",
      "Unlimited offices & branches",
      "Audit trail exports",
      "Priority support",
      "Custom onboarding",
    ],
    highlighted: true,
  },
];

const FAQS = [
  {
    q: "Is there a free plan?",
    a: "No free plan, but every account starts with a 14-day free trial — no credit card needed.",
  },
  { q: "Can I change plans anytime?", a: "Yes, upgrade or downgrade anytime." },
  {
    q: "Do you offer discounts for NGOs or government?",
    a: "Yes, contact us.",
  },
  {
    q: "Is our data secure?",
    a: "All data is encrypted. We never share or sell your organization's data to any third party.",
  },
];

function PriceCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  // Yearly billing = 2 months free → 10× the monthly rate per year.
  const price = yearly ? plan.monthly * 10 : plan.monthly;
  const perMonth = yearly ? Math.round((plan.monthly * 10) / 12) : plan.monthly;

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-6 sm:p-8",
        plan.highlighted ? "border-2 border-[#C0392B]" : "border-[#E0DBD0]",
      )}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-[#1A1814]">{plan.name}</h3>
        {plan.highlighted && (
          <span className="rounded-full bg-[#C0392B]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#C0392B]">
            Recommended
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-[#6B6560]">{plan.tagline}</p>

      <div className="mt-5">
        <span className={cn(display, "text-4xl text-[#1A1814]")}>₹{price.toLocaleString("en-IN")}</span>
        <span className="text-sm text-[#6B6560]">{yearly ? " /year" : " /month"}</span>
      </div>
      <p className="mt-1 text-xs text-[#6B6560]">
        {yearly ? `≈ ₹${perMonth.toLocaleString("en-IN")}/mo · 2 months free` : "billed monthly"}
      </p>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-[#6B6560]">
        14-day free trial · no credit card required
      </p>

      <Link
        href="/register"
        className={cn(
          "mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-colors",
          plan.highlighted
            ? "bg-[#C0392B] text-white hover:bg-[#a83324]"
            : "border border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B] hover:text-white",
        )}>
        Start 14-day free trial
        <ArrowRight className="size-4" />
      </Link>

      <ul className="mt-6 space-y-3 border-t border-[#E0DBD0] pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-[#1A1814]">
            <Check className="mt-0.5 size-4 shrink-0 text-[#27AE60]" strokeWidth={3} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen scroll-smooth bg-[#F7F4EE] text-[#1A1814]">
      <LandingNav />

      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:py-20">
        {/* Heading */}
        <div className="text-center">
          <h1 className={cn(display, "text-4xl text-[#1A1814] sm:text-5xl")}>Simple, honest pricing</h1>
          <p className="mx-auto mt-3 max-w-md text-[#6B6560]">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-lg border border-[#E0DBD0] bg-white p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                !yearly ? "bg-[#C0392B] text-white" : "text-[#6B6560] hover:text-[#1A1814]",
              )}>
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                yearly ? "bg-[#C0392B] text-white" : "text-[#6B6560] hover:text-[#1A1814]",
              )}>
              Yearly
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  yearly ? "bg-white/20 text-white" : "bg-[#27AE60]/12 text-[#1E8449]",
                )}>
                2 months free
              </span>
            </button>
          </div>
        </div>

        {/* Trust banner */}
        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 rounded-xl border border-[#E0DBD0] bg-white px-4 py-3 text-center text-sm text-[#1A1814]">
          <Lock className="size-4 shrink-0 text-[#C0392B]" />
          <span>🔒 Your data stays yours. We don&apos;t sell, share, or mine your data. Ever.</span>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <PriceCard key={plan.name} plan={plan} yearly={yearly} />
          ))}
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className={cn(display, "text-center text-3xl text-[#1A1814] sm:text-4xl")}>
            Pricing questions
          </h2>
          <div className="mt-8 border-t border-[#E0DBD0]">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group border-b border-[#E0DBD0] py-4 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-base font-medium text-[#1A1814] marker:content-['']">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-[#6B6560] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#6B6560]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0DBD0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="font-mono text-xs text-[#6B6560]">
            © {new Date().getFullYear()} DeskRoute
          </p>
          <Link href="/" className="text-sm font-medium text-[#6B6560] transition-colors hover:text-[#1A1814]">
            ← Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
