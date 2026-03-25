"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const signupsNav = [{ href: "/admin", label: "Dashboard" }];

const awinApiNav = [
  { href: "/admin/awin/connection", label: "Connection" },
  { href: "/admin/awin/programs", label: "Programs" },
  { href: "/admin/awin/campaigns", label: "Campaigns" },
  { href: "/admin/awin/reports", label: "Reports" },
  { href: "/admin/awin/actions", label: "Actions" },
  { href: "/admin/awin/tracking-links", label: "Tracking links" },
  { href: "/admin/awin/applications", label: "Applications" },
];

function navClass(active: boolean) {
  return active
    ? "block rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white"
    : "block rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    };
    check();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.replace("/admin/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={120} height={38} className="h-8 w-auto" />
            <span className="text-sm font-medium text-amber-400/90">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        <div className="border-b border-white/10 bg-zinc-900/40 px-4 py-3 md:hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Admin menu</p>
          <nav className="mt-2 flex gap-2 overflow-x-auto pb-1 text-sm">
            <Link href="/admin" className="shrink-0 rounded-md border border-white/10 px-2.5 py-1.5 text-zinc-300">
              Dashboard
            </Link>
            {awinApiNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-2.5 py-1.5 ${pathname === item.href ? "bg-teal-600 text-white" : "border border-white/10 text-zinc-300"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-zinc-900/50 py-6 pl-4 pr-3 md:block lg:w-64">
          <nav className="space-y-6">
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Overview</p>
              <ul className="mt-2 space-y-0.5">
                {signupsNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={navClass(pathname === item.href)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="px-3 text-sm font-bold text-white">Awin</p>
              <p className="px-3 text-xs text-zinc-500">API sections</p>
              <ul className="mt-2 space-y-0.5">
                {awinApiNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link href={item.href} className={navClass(active)}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </aside>

        <main className="min-h-[calc(100vh-73px)] flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
