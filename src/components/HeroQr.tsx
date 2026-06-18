"use client";

import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";

/**
 * A real, scannable QR code rendered with `react-qr-code` (pure SVG).
 * Defaults to a DeskRoute tracking deep-link so scanning demonstrates the
 * actual workflow — open a file's live status straight from the receipt.
 */
export function HeroQr({
  value = "https://deskroute.app/t/DR-0042",
  className,
}: {
  value?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md bg-white p-1.5", className)}>
      <QRCode
        value={value}
        level="M"
        bgColor="#ffffff"
        fgColor="#111113"
        style={{ height: "100%", width: "100%" }}
        viewBox="0 0 256 256"
      />
    </div>
  );
}
