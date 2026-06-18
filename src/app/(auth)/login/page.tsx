// app/(auth)/login/page.tsx
"use client";

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

      const user = data?.user as { role?: string; organizationId?: string } | undefined;
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
    <div className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-4 py-10">
      <div className="w-full max-w-[400px]">
        {/* faint route-diagram watermark */}
        <div aria-hidden className="mb-6 flex items-center justify-center gap-2 opacity-40">
          <span className="size-2 rounded-full bg-[#C0392B]" />
          <span className="h-px w-10 bg-[#E0DBD0]" />
          <span className="size-2 rounded-full border border-[#6B6560]" />
          <span className="h-px w-10 bg-[#E0DBD0]" />
          <span className="size-2 rounded-full border border-[#6B6560]" />
        </div>

        <div className="rounded-xl border border-[#E0DBD0] bg-white p-8">
          <h1 className="text-center font-serif text-3xl leading-none text-[#1A1814]">DeskRoute</h1>
          <p className="mt-2 text-center text-sm text-[#6B6560]">Sign in to your workspace</p>

          <div className="my-6 h-px bg-[#E0DBD0]" />

          <GoogleButton callbackURL="/onboarding" label="Continue with Google" onError={setError} />

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#E0DBD0]" />
            <span className="text-xs text-[#6B6560]">or</span>
            <span className="h-px flex-1 bg-[#E0DBD0]" />
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-3 py-2.5 text-sm text-[#C0392B]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1A1814]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="h-10 w-full rounded-lg border border-[#E0DBD0] bg-white px-3 text-sm text-[#1A1814] outline-none placeholder:text-[#6B6560] focus-visible:border-[#C0392B] focus-visible:ring-2 focus-visible:ring-[#C0392B]/30"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[#1A1814]">
                  Password
                </label>
                <Link href="#" className="text-xs text-[#6B6560] transition-colors hover:text-[#1A1814]">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-10 w-full rounded-lg border border-[#E0DBD0] bg-white px-3 text-sm text-[#1A1814] outline-none placeholder:text-[#6B6560] focus-visible:border-[#C0392B] focus-visible:ring-2 focus-visible:ring-[#C0392B]/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-[#C0392B] text-sm font-semibold text-white transition-colors hover:bg-[#a83324] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6560]">
            New to DeskRoute?{" "}
            <Link href="/register" className="font-semibold text-[#C0392B] hover:underline">
              Create an account
            </Link>
          </p>

          <p className="mt-6 text-center font-mono text-[11px] tracking-wide text-[#6B6560]">
            DeskRoute · Physical file tracking
          </p>
        </div>
      </div>
    </div>
  );
}
