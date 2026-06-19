"use client";

import { Clock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISS_KEY = "deskroute:trial-banner-dismissed";

/**
 * Full-width trial banner shown above the app shell while a trial is active.
 * Dismissal is persisted to localStorage so it stays hidden for the session.
 */
export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  // Start hidden to avoid a flash before we can read localStorage on the client.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed) return null;

  const urgent = daysLeft <= 3;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="relative flex h-10 shrink-0 items-center justify-center gap-2 border-b border-[#C0392B]/20 bg-[#C0392B]/10 px-10 text-sm">
      <Clock className="size-4 shrink-0 text-[#C0392B]" />
      <span className="truncate text-[#1A1814]">
        {urgent
          ? `Trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
          : `Your free trial ends in ${daysLeft} days.`}
      </span>
      <Link
        href="#"
        className="shrink-0 font-semibold text-[#C0392B] underline underline-offset-2 hover:opacity-80">
        Upgrade now →
      </Link>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 flex size-6 items-center justify-center rounded text-[#6B6560] transition-colors hover:text-[#1A1814]">
        <X className="size-4" />
      </button>
    </div>
  );
}
