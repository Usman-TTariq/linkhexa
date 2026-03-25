"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ThankYouContent() {
  const searchParams = useSearchParams();
  const needsVerify = searchParams.get("verify") === "1";

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>
      <div className="relative max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white">
          <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={120} height={38} className="h-9 w-auto" />
        </Link>
        <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
            Thank You for Signing Up
          </h1>
          {needsVerify && (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Please <strong className="text-amber-50">confirm your email</strong> using the link we sent. After you confirm,{" "}
              <strong className="text-amber-50">log in once</strong> so your profile is saved for admin approval (email confirmation
              skips the immediate profile step).
            </p>
          )}
          <p className="mt-3 text-zinc-400">
            Your account is <strong className="text-zinc-300">pending approval</strong>. An admin will review it in the dashboard;
            you can log in after approval.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            If you have questions, use <Link href="/contact" className="text-indigo-400 hover:underline">contact</Link>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="inline-flex justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
