"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, FileText } from "lucide-react";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E0DBD0] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-8 items-center justify-center rounded-md bg-[#1A1814]">
            <FileText className="size-4 text-[#F7F4EE]" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1A1814]">DeskRoute</span>
        </Link>

        {/* Center links — desktop */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#6B6560] md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-[#1A1814]">
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA — desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-[#6B6560] transition-colors hover:text-[#1A1814]">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-[#C0392B] px-4 py-2 text-sm font-semibold text-[#C0392B] transition-colors hover:bg-[#C0392B] hover:text-white">
            Get started free
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-md border border-[#E0DBD0] text-[#1A1814] md:hidden">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#E0DBD0] bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-[#1A1814]">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[#E0DBD0] pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="py-1.5 text-sm font-medium text-[#6B6560]">
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[#C0392B] px-4 py-2 text-center text-sm font-semibold text-[#C0392B]">
                Get started free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
