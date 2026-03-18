"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/advertisers", label: "Advertisers" },
  { href: "/publishers", label: "Publishers" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-zinc-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/80"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
        >
          <Image
            src="/LinkHexa Logo Svg.svg"
            alt="LinkHexa"
            width={160}
            height={50}
            className="h-10 w-auto sm:h-11"
            priority
          />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5">
            {navLinks.map((link, i) => (
              <span key={link.href + link.label} className="flex items-center gap-5">
                {i === 2 && <span className="text-zinc-500">|</span>}
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white ${(link.href === "/" && pathname === "/") || (link.href === "/about" && pathname === "/about") || (link.href === "/contact" && pathname === "/contact") || (link.href === "/advertisers" && pathname === "/advertisers") || (link.href === "/publishers" && pathname === "/publishers") || (link.href === "/blog" && pathname?.startsWith("/blog")) ? "text-indigo-400" : "text-zinc-400"}`}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
          <Link
            href="/get-started"
            className="ml-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-200"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="h-0.5 w-6 bg-white"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="h-0.5 w-6 bg-white"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="h-0.5 w-6 bg-white"
          />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-strong border-t border-white/5 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/get-started"
                className="mt-3 rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-black hover:bg-zinc-200"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
