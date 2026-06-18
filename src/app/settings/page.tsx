"use client";

import { AppShell } from "@/components/AppShell";
import { SkeletonBar } from "@/components/SkeletonRow";
import type { Organization } from "@/features/organization/organization.types";
import { httpService } from "@/lib/httpService";
import { cn } from "@/lib/utils";
import { Building2, Check, Tags, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tab = "general" | "offices" | "team" | "statuses" | "roles";
const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "offices", label: "Offices" },
  { key: "statuses", label: "Statuses" },
  { key: "team", label: "Team" },
  { key: "roles", label: "Roles" },
];

const ROLE_MATRIX = {
  columns: ["View all", "Route files", "Manage branches", "Configure statuses", "Invite members"],
  rows: [
    { role: "Admin", perms: [true, true, true, true, true] },
    { role: "Manager", perms: [true, true, true, false, false] },
    { role: "Staff", perms: [false, true, false, false, false] },
  ],
};

function LinkOutCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-[#E0DBD0] bg-white p-6 sm:flex-row sm:items-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-[#F7F4EE] text-[#1A1814]">
        <Icon className="size-5" />
      </span>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-[#1A1814]">{title}</h3>
        <p className="mt-0.5 text-sm text-[#6B6560]">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex h-9 items-center rounded-md border border-[#C0392B] px-4 text-sm font-semibold text-[#C0392B] transition-colors hover:bg-[#C0392B] hover:text-white">
        {cta}
      </Link>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpService
      .get<Organization>("/api/organization")
      .then(setOrg)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-4xl px-5 py-6 sm:px-6">
        <h1 className="font-serif text-3xl leading-none text-[#1A1814]">Settings</h1>
        <p className="mt-1.5 text-sm text-[#6B6560]">Manage your organization and team.</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#E0DBD0]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-[#C0392B] text-[#1A1814]"
                  : "border-transparent text-[#6B6560] hover:text-[#1A1814]",
              )}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "general" && (
            <div className="rounded-xl border border-[#E0DBD0] bg-white p-6">
              <h2 className="text-base font-semibold text-[#1A1814]">Organization</h2>
              <dl className="mt-4 space-y-4">
                {[
                  ["Name", org?.name],
                  ["Type", org?.industry || "—"],
                  ["Plan", org?.plan],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1 border-b border-[#E0DBD0] pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-sm text-[#6B6560]">{label}</dt>
                    <dd className="text-sm font-medium text-[#1A1814]">
                      {loading ? <SkeletonBar className="w-32" /> : value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {tab === "offices" && (
            <LinkOutCard
              icon={Building2}
              title="Offices & branches"
              description="Add, edit and organize the offices files route between."
              href="/locations"
              cta="Manage offices"
            />
          )}

          {tab === "statuses" && (
            <LinkOutCard
              icon={Tags}
              title="Status workflow"
              description="Define the custom statuses files move through."
              href="/file-statuses"
              cta="Manage statuses"
            />
          )}

          {tab === "team" && (
            <LinkOutCard
              icon={Users}
              title="Team members"
              description="Invite teammates and set their roles and branch access."
              href="/staff"
              cta="Manage team"
            />
          )}

          {tab === "roles" && (
            <div className="overflow-hidden rounded-xl border border-[#E0DBD0] bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F7F4EE] text-xs uppercase tracking-wide text-[#6B6560]">
                    <th className="px-4 py-3 font-medium">Role</th>
                    {ROLE_MATRIX.columns.map((c) => (
                      <th key={c} className="px-3 py-3 text-center font-medium">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLE_MATRIX.rows.map((row) => (
                    <tr key={row.role} className="border-t border-[#E0DBD0]">
                      <td className="px-4 py-3 font-medium text-[#1A1814]">{row.role}</td>
                      {row.perms.map((on, i) => (
                        <td key={i} className="px-3 py-3 text-center">
                          {on ? (
                            <Check className="mx-auto size-4 text-[#27AE60]" strokeWidth={3} />
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
          )}
        </div>
      </div>
    </AppShell>
  );
}
