// app/(auth)/register/page.tsx
"use client";

import { GoogleButton } from "@/components/GoogleButton";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function strengthOf(pw: string): { score: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.max(1, s) as 1 | 2 | 3;
  return [
    { score: 1, label: "Weak", color: "#C0392B" },
    { score: 2, label: "Okay", color: "#E67E22" },
    { score: 3, label: "Strong", color: "#27AE60" },
  ][score - 1] as { score: 1 | 2 | 3; label: string; color: string };
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => strengthOf(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      const { error: signUpError } = await authClient.signUp.email({
        name,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message || "Could not create account");
        return;
      }
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-4 py-10">
      <div className="w-full max-w-[400px]">
        {/* Trust strip */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[12px] text-[#6B6560]">
          <span>✓ No credit card required</span>
          <span>✓ 14-day free trial</span>
          <span>✓ Works without scanners</span>
        </div>

        <div className="rounded-xl border border-[#E0DBD0] bg-white p-8">
          <h1 className="text-center font-serif text-3xl leading-none text-[#1A1814]">DeskRoute</h1>
          <p className="mt-2 text-center text-sm text-[#6B6560]">Create your account</p>
          <p className="text-center text-sm text-[#6B6560]">Start tracking files in minutes.</p>

          <div className="my-6 h-px bg-[#E0DBD0]" />

          <GoogleButton callbackURL="/onboarding" label="Sign up with Google" onError={setError} />

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-[#1A1814]">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  autoComplete="given-name"
                  className="h-10 w-full rounded-lg border border-[#E0DBD0] bg-white px-3 text-sm text-[#1A1814] outline-none placeholder:text-[#6B6560] focus-visible:border-[#C0392B] focus-visible:ring-2 focus-visible:ring-[#C0392B]/30"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-[#1A1814]">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="h-10 w-full rounded-lg border border-[#E0DBD0] bg-white px-3 text-sm text-[#1A1814] outline-none placeholder:text-[#6B6560] focus-visible:border-[#C0392B] focus-visible:ring-2 focus-visible:ring-[#C0392B]/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1A1814]">
                Work email
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
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1A1814]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="h-10 w-full rounded-lg border border-[#E0DBD0] bg-white px-3 text-sm text-[#1A1814] outline-none placeholder:text-[#6B6560] focus-visible:border-[#C0392B] focus-visible:ring-2 focus-visible:ring-[#C0392B]/30"
              />
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 gap-1">
                    {[1, 2, 3].map((seg) => (
                      <span
                        key={seg}
                        className="flex-1 rounded-full"
                        style={{
                          backgroundColor: seg <= strength.score ? strength.color : "#E0DBD0",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-[#C0392B] text-sm font-semibold text-white transition-colors hover:bg-[#a83324] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs leading-relaxed text-[#6B6560]">
            By creating an account you agree to our{" "}
            <Link href="#" className="text-[#1A1814] underline">Terms</Link> and{" "}
            <Link href="#" className="text-[#1A1814] underline">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-[#6B6560]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#C0392B] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
