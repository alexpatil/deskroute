// app/files/[id]/receipt/page.tsx
"use client";

import { PageLoader } from "@/components/Loading";
import type { FileWithHistory } from "@/features/files/file.types";
import { formatFileNumber } from "@/features/files/file.utils";
import { httpService } from "@/lib/httpService";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const fmt = (d: Date) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function FileReceiptPage() {
  const params = useParams();
  const fileId = params.id as string;
  const [file, setFile] = useState<FileWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    httpService
      .get<FileWithHistory>(`/api/files/${fileId}`)
      .then(setFile)
      .catch(() => setFile(null))
      .finally(() => setLoading(false));
  }, [fileId]);

  if (loading) return <PageLoader />;

  if (!file) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4EE] px-4 text-center">
        <p className="font-serif text-3xl text-[#1A1814]">Receipt unavailable</p>
        <p className="mt-2 text-sm text-[#6B6560]">This file doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/dashboard" className="mt-6 text-sm font-semibold text-[#C0392B] hover:underline">
          Back to files
        </Link>
      </div>
    );
  }

  const shortCode = formatFileNumber(file);
  const qrValue = `${origin}/files/${file.id}`;

  return (
    <div className="min-h-screen bg-[#F7F4EE]">
      {/* Toolbar — hidden when printing */}
      <div className="flex items-center justify-between border-b border-[#E0DBD0] bg-white px-4 py-3 print:hidden sm:px-6">
        <Link
          href={`/files/${file.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B6560] transition-colors hover:text-[#1A1814]">
          <ArrowLeft className="size-4" />
          Back to file
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#C0392B] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
          <Printer className="size-4" />
          Print
        </button>
      </div>

      {/* Receipt */}
      <div className="mx-auto max-w-md px-4 py-8 print:px-0 print:py-0">
        <div className="rounded-xl border-2 border-dashed border-[#9A948A] bg-white p-6 print:rounded-none print:border-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E0DBD0] pb-3">
            <span className="text-lg font-bold text-[#1A1814]">DeskRoute</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B6560]">
              File Receipt
            </span>
          </div>

          {/* Number + QR */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6B6560]">File No.</p>
              <p className="mt-0.5 font-mono text-4xl font-extrabold tracking-wider text-[#1A1814]">
                {shortCode}
              </p>
            </div>
            <div className="shrink-0 rounded-lg border border-[#E0DBD0] bg-white p-2">
              <QRCode value={qrValue} size={120} bgColor="#ffffff" fgColor="#1A1814" />
            </div>
          </div>

          {/* Details */}
          <dl className="mt-5 space-y-2 border-t border-[#E0DBD0] pt-4 text-sm">
            {[
              ["Subject", file.subjectName],
              ["Category", file.category],
              ["Office", file.currentLocation.name],
              ["Status", file.currentStatus.name],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <dt className="w-20 shrink-0 font-medium text-[#6B6560]">{label}</dt>
                <dd className="font-medium text-[#1A1814]">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Route history */}
          <div className="mt-5 border-t border-[#E0DBD0] pt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6B6560]">
              Route history
            </p>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#6B6560]">
                  <th className="py-1 font-medium">Office</th>
                  <th className="py-1 font-medium">Status</th>
                  <th className="py-1 text-right font-medium">Date/Time</th>
                </tr>
              </thead>
              <tbody className="text-[#1A1814]">
                {file.history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-2 text-center text-[#6B6560]">No history yet</td>
                  </tr>
                ) : (
                  file.history.map((h) => (
                    <tr key={h.id} className="border-t border-[#E0DBD0]">
                      <td className="py-1.5 pr-2">{h.toLocation.name}</td>
                      <td className="py-1.5 pr-2">{h.newStatusName ?? h.status.name}</td>
                      <td className="py-1.5 text-right font-mono text-[#6B6560]">{fmt(h.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <p className="mt-5 border-t border-[#E0DBD0] pt-3 text-center text-[10px] text-[#9A948A]">
            Scan to view live file status at deskroute.vercel.app
          </p>
        </div>
      </div>
    </div>
  );
}
