"use client";

import Link from "next/link";
import Image from "next/image";

const exploreMore = [
  { label: "Advertisers", href: "/advertisers" },
  { label: "Publishers", href: "/publishers" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/#blog" },
  { label: "Contact", href: "/contact" },
];

const legalInfo = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Imprint", href: "/imprint" },
  { label: "Mediakit", href: "/mediakit" },
];

const socials = [
  { name: "Facebook", href: "#", icon: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  )},
  { name: "Instagram", href: "#", icon: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  )},
  { name: "X", href: "#", icon: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  )},
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 py-12 sm:py-16">
      {/* Purple spots + faded Link / Hexa (same as HowItWorks, TrustAndPartnerships) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[280px] w-[280px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute right-0 bottom-1/3 h-[280px] w-[280px] rounded-full bg-violet-500/12 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
        <div
          className="absolute left-0 top-0 hidden h-full w-[min(28%,220px)] items-center pl-4 sm:flex sm:pl-6 md:pl-8"
          style={{
            maskImage: "linear-gradient(to right, black 20%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 100%)",
          }}
        >
          <span
            className="text-5xl font-bold tracking-tight text-black sm:text-6xl md:text-7xl"
            style={{
              fontFamily: "var(--font-libre-baskerville), serif",
              letterSpacing: "-0.03em",
              opacity: 0.35,
            }}
          >
            Link
          </span>
        </div>
        <div
          className="absolute right-0 top-0 hidden h-full w-[min(28%,220px)] items-center justify-end pr-4 sm:flex sm:pr-6 md:pr-8"
          style={{
            maskImage: "linear-gradient(to left, black 20%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 20%, transparent 100%)",
          }}
        >
          <span
            className="text-5xl font-bold tracking-tight text-black sm:text-6xl md:text-7xl"
            style={{
              fontFamily: "var(--font-libre-baskerville), serif",
              letterSpacing: "-0.03em",
              opacity: 0.35,
            }}
          >
            Hexa
          </span>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
          <div className="text-center sm:text-left lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/LinkHexa Logo Svg.svg"
                alt="LinkHexa"
                width={140}
                height={44}
                className="h-8 w-auto sm:h-9"
              />
            </Link>
            <p className="mx-auto mt-3 max-w-xs text-sm text-zinc-500 sm:mx-0 sm:mt-4">
              The leading affiliate marketing platform connecting publishers and merchants worldwide.
            </p>
            <div className="mt-5 flex justify-center gap-3 sm:justify-start sm:mt-6">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white">Explore More</h3>
            <ul className="mt-4 space-y-3">
              {exploreMore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white">Legal Information</h3>
            <ul className="mt-4 space-y-3">
              {legalInfo.map((link) => (
                <li key={link.label}>
                  {"openInNewTab" in link && link.openInNewTab ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white">Get Support</h3>
            <ul className="mt-4 space-y-3 text-xs text-zinc-500 sm:text-sm">
              <li>
                <a href="mailto:partner@linkhexa.com" className="break-all transition-colors hover:text-white">
                  partner@linkhexa.com
                </a>
              </li>
              <li>
                <a href="mailto:support@linkhexa.com" className="break-all transition-colors hover:text-white">
                  support@linkhexa.com
                </a>
              </li>
              <li>
                <a href="mailto:legal@linkhexa.com" className="break-all transition-colors hover:text-white">
                  legal@linkhexa.com
                </a>
              </li>
              <li>
                <a href="tel:+15108631830" className="transition-colors hover:text-white">
                  +1 510 863 1830
                </a>
              </li>
              <li className="pt-1">
                <span className="block">811 Wilshire Blvd Ste 1753</span>
                <span className="block">Los Angeles, CA 90017</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-zinc-500 sm:mt-16 sm:pt-8 sm:text-sm">
          © {new Date().getFullYear()} LinkHexa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
