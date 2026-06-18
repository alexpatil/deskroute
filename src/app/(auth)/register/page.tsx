// app/(auth)/register/page.tsx
"use client";

import { Button } from "@/components/Button";
import { GoogleButton } from "@/components/GoogleButton";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({ name, email, password });

      if (signUpError) {
        setError(signUpError.message || "Could not create account");
        return;
      }

      // New accounts have no organization yet — send them to set one up.
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Brand panel */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ backgroundColor: "var(--color-primary)" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex items-center gap-2.5 text-white">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h5l3-9 4 18 3-9h3" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">DeskRoute</span>
        </div>

        <div className="relative text-white">
          <h2 className="max-w-md text-balance text-3xl font-bold leading-tight tracking-tight">
            Track physical files across every office with QR codes.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
            Create your workspace in minutes. Follow every file desk to desk, scan to check its live
            status, and keep a complete, timestamped history.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            {["No lost files", "Works without scanners", "Free to start"].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} DeskRoute</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div
              className="mb-4 flex size-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "var(--color-primary)" }}>
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h5l3-9 4 18 3-9h3" />
              </svg>
            </div>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
              Create your account
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-textMuted)" }}>
              Start tracking files in minutes — no credit card required.
            </p>
          </div>

          {error && (
            <div
              className="mb-5 rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: "var(--color-dangerLight)", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          <GoogleButton callbackURL="/onboarding" label="Sign up with Google" onError={setError} />

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-textSubtle)" }}>
              or
            </span>
            <span className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                className="field field-lg"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                Work email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="field field-lg"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="field field-lg"
              />
            </div>

            <Button type="submit" disabled={loading} loading={loading} fullWidth className="mt-2">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--color-textMuted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs" style={{ color: "var(--color-textSubtle)" }}>
            By creating an account you agree to keep your workspace data accurate.
          </p>
        </div>
      </div>
    </div>
  );
}
