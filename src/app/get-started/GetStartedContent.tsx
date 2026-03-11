"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const advertiserBenefits = [
  "Connect with top affiliates",
  "Get high-converting traffic",
  "Track performance in real-time",
  "Scale with performance marketing",
];

const publisherBenefits = [
  "Access high-paying programs",
  "Monetize content easily",
  "Get real-time insights",
  "Join & earn with trusted network",
];

const faqs = [
  {
    q: "How do I sign up for LinkHexa?",
    a: "Choose your path above—Advertiser or Publisher—and click the sign-up button. You’ll complete a short form and our team will reach out to onboard you.",
  },
  {
    q: "Who can join LinkHexa as a publisher?",
    a: "Bloggers, content creators, social media influencers, and anyone with quality traffic can apply. We look for authentic audiences and compliant promotion.",
  },
  {
    q: "How do advertisers benefit from LinkHexa?",
    a: "Advertisers get access to vetted publishers, real-time tracking, flexible payment terms, and dedicated support to scale performance campaigns.",
  },
  {
    q: "Is there a cost to join LinkHexa?",
    a: "Joining is free for both advertisers and publishers. We earn when you succeed—through performance-based commissions and fees.",
  },
];

const CheckIcon = () => (
  <svg className="h-5 w-5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function GetStartedContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      {/* Announcement bar - below navbar */}
      <div className="border-b border-white/10 bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 py-2.5 text-center text-sm sm:px-6 lg:px-8">
          <span className="text-zinc-300">Welcome to the future of affiliate marketing —</span>
          <Link href="#partnership" className="inline-flex items-center gap-1 font-medium text-indigo-400 transition-colors hover:text-indigo-300">
            Get started
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          <span className="text-zinc-500">✨</span>
        </div>
      </div>

      <main className="min-h-screen pt-24 pb-20 sm:pt-28">
        {/* Choose the right partnership - hero + 2 cards */}
        <section id="partnership" className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8 lg:pt-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute -right-32 top-1/3 h-[240px] w-[240px] rounded-full bg-violet-500/10 blur-[80px]" />
          </div>
          <div className="relative mx-auto max-w-5xl">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Get started</p>
            <h1 className="mt-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
              Choose the right partnership
            </h1>
            {/* Partnership / collaboration visual */}
            <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/Happy-work-team-cheering-and-celebrating-at-meeting-team-collaboration.jpg"
                  alt="Team collaboration and success"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                />
              </div>
            </div>
            <div className="mt-12 grid gap-6 sm:gap-8 lg:grid-cols-2">
              {/* Advertiser card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-sm sm:p-8"
              >
                <h2 className="text-xl font-bold text-white sm:text-2xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
                  As an <span className="text-indigo-400">Advertiser</span>
                </h2>
                <p className="mt-3 text-zinc-400">Grow your brand with top affiliates and performance marketing.</p>
                <Link
                  href="/get-started#partnership"
                  className="mt-6 inline-flex w-full justify-center rounded-lg bg-indigo-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Advertiser Sign Up
                </Link>
                <p className="mt-4 text-center text-sm text-zinc-500">Or</p>
                <Link href="/contact" className="mt-1 text-center text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                  Already registered? Login Here
                </Link>
                <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                  {advertiserBenefits.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Publisher card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-sm sm:p-8"
              >
                <h2 className="text-xl font-bold text-white sm:text-2xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
                  As a <span className="text-indigo-400">Publisher</span>
                </h2>
                <p className="mt-3 text-zinc-400">Turn your content into income with top brand partnerships.</p>
                <Link
                  href="/get-started#partnership"
                  className="mt-6 inline-flex w-full justify-center rounded-lg bg-indigo-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Publisher Sign Up
                </Link>
                <p className="mt-4 text-center text-sm text-zinc-500">Or</p>
                <Link href="/contact" className="mt-1 text-center text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                  Already registered? Login Here
                </Link>
                <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                  {publisherBenefits.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">FAQ&apos;s</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
              Frequently Asked Questions
            </h2>
            <div className="mt-10 space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-white">Q. {faq.q}</span>
                    <span className={`shrink-0 text-indigo-400 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-white/5 px-5 py-4 text-sm text-zinc-400">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Become a Top-Earning Partner */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Join LinkHexa now!</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
              Become a Top-Earning Partner
            </h2>
            <div className="mt-10 flex flex-col gap-8 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-8">
              <div className="space-y-4">
                <p className="text-zinc-300">
                  Generate more sales, monetize traffic, and earn commissions by joining the LinkHexa partner network today.
                </p>
                <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckIcon />
                    Join LinkHexa for free.
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckIcon />
                    24/7 partner support.
                  </li>
                </ul>
              </div>
              <Link
                href="#partnership"
                className="shrink-0 rounded-lg bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
