import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trial ended — DeskRoute",
};

export default function TrialExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-4 py-10">
      <div className="w-full max-w-[480px] text-center">
        <p className="font-serif text-2xl leading-none text-[#1A1814]">DeskRoute</p>

        <div className="mt-8 rounded-xl border border-[#E0DBD0] bg-white p-8">
          <h1 className="font-serif text-4xl leading-tight text-[#1A1814]">Your trial has ended.</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[#6B6560]">
            Your 14-day free trial has expired. Upgrade to continue tracking files.
          </p>

          <Link
            href="#"
            className="mt-7 flex h-11 w-full items-center justify-center rounded-md bg-[#C0392B] text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
            Upgrade now
          </Link>

          <a
            href="mailto:hello@deskroute.app"
            className="mt-4 inline-block text-sm text-[#6B6560] transition-colors hover:text-[#1A1814]">
            Questions? Contact us
          </a>
        </div>

        <p className="mt-6 text-xs text-[#6B6560]">
          Your data is safe — it will be here when you upgrade.
        </p>
      </div>
    </div>
  );
}
