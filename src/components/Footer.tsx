"use client";

import Link from "next/link";
import Image from "next/image";

const exploreMore = [
  { label: "Advertisers", href: "#advertisers" },
  { label: "Publishers", href: "#publishers" },
  { label: "About", href: "#" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const legalInfo = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Imprint", href: "/imprint" },
  { label: "Mediakit", href: "#" },
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
    <footer className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/LinkHexa Logo Svg.svg"
                alt="LinkHexa"
                width={140}
                height={44}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-zinc-500">
              The leading affiliate marketing platform connecting publishers and merchants worldwide.
            </p>
            <div className="mt-6 flex gap-3">
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
          <div>
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
          <div>
            <h3 className="text-sm font-semibold text-white">Legal Information</h3>
            <ul className="mt-4 space-y-3">
              {legalInfo.map((link) => (
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
          <div>
            <h3 className="text-sm font-semibold text-white">Get Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-500">
              <li>
                <a href="mailto:partner@linkhexa.com" className="transition-colors hover:text-white">
                  partner@linkhexa.com
                </a>
              </li>
              <li>
                <a href="mailto:support@linkhexa.com" className="transition-colors hover:text-white">
                  support@linkhexa.com
                </a>
              </li>
              <li>
                <a href="mailto:legal@linkhexa.com" className="transition-colors hover:text-white">
                  legal@linkhexa.com
                </a>
              </li>
              <li>
                <a href="tel:+18472087685" className="transition-colors hover:text-white">
                  +1 847 208 7685
                </a>
              </li>
              <li className="pt-1">
                <span className="block">734 S Charlotte St</span>
                <span className="block">Lombard, IL 60148</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-white/5 pt-8 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} LinkHexa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
