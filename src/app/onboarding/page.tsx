// app/onboarding/page.tsx
"use client";

import { Button } from "@/components/Button";
import { httpService } from "@/lib/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ORG_TYPES = [
  "Healthcare",
  "Government",
  "Legal",
  "Finance",
  "Insurance",
  "Education",
  "Logistics",
  "Real Estate",
  "Manufacturing",
  "Nonprofit",
  "Other",
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Italy", "Netherlands", "Ireland", "United Arab Emirates",
  "Saudi Arabia", "Qatar", "Singapore", "Malaysia", "Indonesia", "Philippines",
  "Japan", "South Korea", "China", "Hong Kong", "New Zealand", "South Africa",
  "Nigeria", "Kenya", "Egypt", "Brazil", "Mexico", "Argentina", "Bangladesh",
  "Pakistan", "Sri Lanka", "Nepal", "Other",
];

function getTimezones(): string[] {
  try {
    const supported = (Intl as any).supportedValuesOf?.("timeZone") as string[] | undefined;
    if (supported && supported.length) return supported;
  } catch {
    /* fall through to a small default set */
  }
  return [
    "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
    "Europe/London", "Europe/Berlin", "Europe/Paris",
    "America/New_York", "America/Chicago", "America/Los_Angeles",
    "Australia/Sydney", "UTC",
  ];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");

  const timezones = useMemo(getTimezones, []);

  // Send users who can't (or don't need to) onboard here straight to the right place.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await httpService.get<{ hasOrganization: boolean; isSystemAdmin: boolean }>(
          "/api/auth/me",
        );
        if (cancelled) return;
        if (me.isSystemAdmin) {
          router.replace("/system/organizations");
          return;
        }
        if (me.hasOrganization) {
          router.replace("/dashboard");
          return;
        }
        setChecking(false);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Default the timezone to the visitor's local zone once we show the form.
  useEffect(() => {
    if (!checking && !timezone) {
      try {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
      } catch {
        /* leave blank */
      }
    }
  }, [checking, timezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    setSubmitting(true);
    try {
      await httpService.post("/api/organization", {
        name: name.trim(),
        type: type || undefined,
        logoUrl: logoUrl.trim() || undefined,
        primaryContact: primaryContact.trim() || undefined,
        country: country || undefined,
        timezone: timezone || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create organization");
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}>
        <p className="text-sm" style={{ color: "var(--color-textMuted)" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--color-background)" }}>
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo + heading */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--color-primary)" }}>
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h5l3-9 4 18 3-9h3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
            Create your organization
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--color-textMuted)" }}>
            You'll be the owner — set up your workspace to start tracking files.
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}>
          {error && (
            <div
              className="mb-5 rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: "var(--color-dangerLight)", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                Organization name <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Registry Office"
                className="field field-lg"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                Organization type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="field field-lg field-select">
                <option value="">Select a type…</option>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                  Primary contact
                </label>
                <input
                  type="text"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  placeholder="Name or email"
                  className="field field-lg"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="field field-lg field-select">
                  <option value="">Select a country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="field field-lg field-select">
                <option value="">Select a timezone…</option>
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                Logo URL <span style={{ color: "var(--color-textSubtle)" }}>(optional)</span>
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://…/logo.png"
                className="field field-lg"
              />
            </div>

            <Button type="submit" disabled={submitting} loading={submitting} fullWidth className="mt-2">
              Create organization
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--color-textSubtle)" }}>
          Deskroute · You can change these details later
        </p>
      </div>
    </div>
  );
}
