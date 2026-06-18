import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Inter, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Body / UI — Inter. Mapped onto --font-geist-sans so the existing token bridge
// (--font-sans) picks it up app-wide without touching every utility.
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Codes, file numbers, timestamps.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display / headings — Instrument Serif. Exposed as --font-instrument and wired
// to Tailwind's `font-serif` in globals.css.
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeskRoute — Physical file tracking",
  description: "Track physical files across multiple offices using QR codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}>
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
