import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4EE] px-4 text-center">
      <p className="font-serif text-8xl leading-none text-[#1A1814]">404</p>
      <p className="mt-4 max-w-sm text-[#6B6560]">
        This file doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link
        href="/dashboard"
        className="mt-7 inline-flex h-10 items-center rounded-md bg-[#C0392B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a83324]">
        Back to files
      </Link>
    </div>
  );
}
