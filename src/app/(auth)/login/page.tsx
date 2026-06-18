// app/(auth)/login/page.tsx
"use client";

import { Button } from "@/components/Button";
import { GoogleButton } from "@/components/GoogleButton";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await authClient.signIn.email({ email, password });

      if (signInError) {
        setError(signInError.message || "Invalid credentials");
        return;
      }

      const user = data?.user as any;
      if (user?.role === "SYSTEM_ADMIN") {
        router.push("/system/organizations");
      } else if (user?.organizationId) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-background)" }}>
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--color-primary)" }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h5l3-9 4 18 3-9h3"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
            Deskroute
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-textMuted)" }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}>
          {error && (
            <div
              className="rounded-lg px-3 py-2.5 text-sm mb-5"
              style={{ backgroundColor: "var(--color-dangerLight)", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          <GoogleButton callbackURL="/onboarding" label="Continue with Google" onError={setError} />

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-textSubtle)" }}>
              or
            </span>
            <span className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                Email
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
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="field field-lg"
              />
            </div>

            <Button type="submit" disabled={loading} loading={loading} fullWidth className="mt-2">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--color-textMuted)" }}>
            New to Deskroute?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "var(--color-primary)" }}>
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--color-textSubtle)" }}>
          Deskroute · Universal File Tracking
        </p>
      </div>
    </div>
  );
}
