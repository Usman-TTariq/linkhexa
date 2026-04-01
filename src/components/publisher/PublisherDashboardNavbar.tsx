"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

export default function PublisherDashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarInitial, setAvatarInitial] = useState("?");
  const [impersonating, setImpersonating] = useState(false);
  const [backLoading, setBackLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dashboardActive = pathname === "/dashboard";
  const brandsActive = pathname?.startsWith("/dashboard/brands") ?? false;

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/publisher/session", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as { username?: string; email?: string; impersonating?: boolean };
        const label = (typeof data.username === "string" && data.username.trim()) || (typeof data.email === "string" ? data.email.split("@")[0] : "") || "?";
        setAvatarInitial((label[0] || "?").toUpperCase());
        setImpersonating(Boolean(data.impersonating));
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setBrandsOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const navLinkClass = (active: boolean) =>
    `relative text-sm font-medium transition-colors ${
      active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
    }`;

  const logout = async () => {
    router.replace("/login");
  };

  const backToAdmin = async () => {
    setBackLoading(true);
    try {
      await fetch("/api/admin/impersonate/clear", { method: "POST", credentials: "include" });
    } finally {
      window.location.href = "/admin";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-zinc-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/90">
      {impersonating && (
        <div className="border-b border-amber-500/20 bg-amber-500/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6 lg:px-8">
            <p className="text-amber-200/90">
              You are viewing this dashboard as admin (publisher impersonation).
            </p>
            <button
              type="button"
              onClick={() => void backToAdmin()}
              disabled={backLoading}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
            >
              {backLoading ? "Returning…" : "Back to admin"}
            </button>
          </div>
        </div>
      )}
      {/* Fixed row height so layout padding matches; border-b sits flush at bottom of this bar (no extra “black” gap below the line). */}
      <nav className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <Link href="/dashboard" className="shrink-0">
            <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={140} height={44} className="h-9 w-auto" priority />
          </Link>

          <div className="hidden items-center gap-1 lg:flex lg:gap-2">
            <Link href="/dashboard" className={`relative px-2 py-1 ${navLinkClass(dashboardActive)}`}>
              Dashboard
              {dashboardActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              )}
            </Link>

            <div className="relative px-1" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setBrandsOpen((o) => !o)}
                className={`relative inline-flex items-center gap-1 rounded-lg px-2 py-1 ${navLinkClass(brandsActive)} hover:bg-white/5`}
                aria-expanded={brandsOpen}
                aria-haspopup="true"
              >
                Brands
                <ChevronDown className="opacity-70" />
                {brandsActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                )}
              </button>
              {brandsOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-white/10 bg-zinc-900 py-1 shadow-xl shadow-black/40">
                  <Link
                    href="/dashboard/brands"
                    className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
                    onClick={() => setBrandsOpen(false)}
                  >
                    All brands
                  </Link>
                  <Link
                    href="/dashboard/brands?filter=approved"
                    className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
                    onClick={() => setBrandsOpen(false)}
                  >
                    My brands
                  </Link>
                </div>
              )}
            </div>

            {(["Reports", "Creatives", "Tools"] as const).map((label) => (
              <span
                key={label}
                className="inline-flex cursor-default items-center gap-0.5 px-2 py-1 text-sm font-medium text-zinc-600 select-none"
                title="Coming soon"
              >
                {label}
                <ChevronDown className="w-3 opacity-40" />
              </span>
            ))}
            <span className="cursor-default px-2 py-1 text-sm font-medium text-zinc-600 select-none" title="Coming soon">
              Payments
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="hidden rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 sm:block"
            aria-label="Notifications"
            title="Coming soon"
          >
            <BellIcon />
          </button>
          <button
            type="button"
            className="hidden rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 sm:block"
            aria-label="Help"
            title="Coming soon"
          >
            <HelpIcon />
          </button>
          <div className="mx-1 hidden h-6 w-px bg-white/10 sm:block" aria-hidden />
          <div className="flex items-center gap-2 pl-1">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
              aria-hidden
            >
              {avatarInitial}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white sm:inline"
            >
              Logout
            </button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-zinc-300 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-zinc-950 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {impersonating && (
              <button
                type="button"
                onClick={() => void backToAdmin()}
                disabled={backLoading}
                className="mb-2 rounded-lg bg-amber-600 px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
              >
                {backLoading ? "Returning…" : "Back to admin"}
              </button>
            )}
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/brands"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              All brands
            </Link>
            <Link
              href="/dashboard/brands?filter=approved"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              My brands
            </Link>
            <p className="px-3 pt-2 text-xs text-zinc-600">Reports, Creatives, Tools, Payments — coming soon</p>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-2 rounded-lg border border-white/10 px-3 py-2.5 text-left text-sm font-medium text-zinc-200 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
