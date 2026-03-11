"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { value: "1,247+", label: "Advertisers" },
  { value: "1.5k+", label: "Publishers" },
  { value: "50+", label: "Countries" },
];

const values = [
  {
    title: "Results-Driven Approach",
    description: "We focus on what matters: measurable outcomes for brands and publishers. Every campaign is built to deliver clear ROI.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "Transparent",
    description: "Clear reporting, honest payouts, and no hidden fees. You always know where you stand with LinkHexa.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Growth-Based",
    description: "We scale with you. From first campaign to global programs, our platform grows with your ambitions.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

const journey = [
  { year: "2020–2021", title: "Getting off the ground", points: ["Founded with a focus on affiliate transparency", "First advertiser and publisher partnerships", "Built core tracking and payout infrastructure"] },
  { year: "2022–2023", title: "Scaling up", points: ["Expanded to 50+ countries", "Launched real-time analytics and fraud detection", "1,000+ advertisers and publishers on the platform"] },
  { year: "2024–2025", title: "Going global", points: ["Enterprise features and API for large networks", "Industry-leading payout speeds and support", "Trusted by brands and publishers worldwide"] },
];

const planPoints = [
  "Continue expanding our publisher and advertiser network in key regions.",
  "Invest in AI-driven optimization and fraud prevention.",
  "Launch new verticals and partnership models to serve more industries.",
];

export default function AboutContent() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
            <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-violet-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-indigo-400"
            >
              About Us
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
            >
              We connect brands with the right publishers and make payouts simple
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg text-zinc-400"
            >
              LinkHexa is the leading affiliate marketing platform that brings advertisers and publishers together with transparent tracking, reliable payouts, and the tools you need to grow.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 grid gap-4 sm:grid-cols-3"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative overflow-hidden border border-white/10 bg-zinc-900/60 backdrop-blur-sm sm:aspect-video"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                    <svg className="h-14 w-14 text-indigo-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-1/4 h-[280px] w-[280px] rounded-full bg-violet-500/15 blur-[100px]" />
            <div className="absolute -right-32 top-1/3 h-[280px] w-[280px] rounded-full bg-indigo-500/15 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-white/10 bg-zinc-900/60 p-8 text-center backdrop-blur-sm"
                >
                  <p className="text-3xl font-bold text-white sm:text-4xl">{s.value}</p>
                  <p className="mt-2 text-zinc-500">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[120px]" />
            <div className="absolute left-0 top-1/2 h-[280px] w-[280px] rounded-full bg-violet-500/15 blur-[100px]" />
            <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.1),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative aspect-video overflow-hidden border border-white/10 bg-zinc-900/60"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                  <svg className="h-24 w-24 text-indigo-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
              </motion.div>
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Our Approach</p>
                <h2
                  className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
                >
                  In performance marketing—we&apos;ve seen what works
                </h2>
                <p className="mt-6 text-zinc-400">
                  We built LinkHexa around one idea: affiliate marketing should be transparent, fast, and fair. Our team has spent years in performance marketing and knows the pain points—delayed payouts, opaque reporting, and trust issues between brands and publishers.
                </p>
                <p className="mt-4 text-zinc-400">
                  We solve that with a single platform that gives everyone real-time visibility, automated payouts, and the support needed to scale. No black boxes, no surprises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Stand For */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(99,102,241,0.06),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">What We Stand For</p>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
            >
              Built on trust and clarity
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center bg-indigo-500/20 text-indigo-400">
                    {v.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{v.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Journey */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[120px]" />
            <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-500/15 blur-[120px]" />
            <div className="absolute left-0 top-0 flex h-full w-[min(28%,220px)] items-center pl-4 sm:pl-6 md:pl-8" style={{ maskImage: "linear-gradient(to right, black 20%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 100%)" }}>
              <span className="text-5xl font-bold tracking-tight text-black sm:text-6xl md:text-7xl" style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.03em", opacity: 0.35 }}>Link</span>
            </div>
            <div className="absolute right-0 top-0 flex h-full w-[min(28%,220px)] items-center justify-end pr-4 sm:pr-6 md:pr-8" style={{ maskImage: "linear-gradient(to left, black 20%, transparent 100%)", WebkitMaskImage: "linear-gradient(to left, black 20%, transparent 100%)" }}>
              <span className="text-5xl font-bold tracking-tight text-black sm:text-6xl md:text-7xl" style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.03em", opacity: 0.35 }}>Hexa</span>
            </div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Our Journey</p>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
            >
              How we got here
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-400">
              From day one, we focused on building a platform that advertisers and publishers could rely on. Here&apos;s how we grew.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {journey.map((j, i) => (
                <motion.div
                  key={j.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-500/20 text-sm font-bold text-indigo-400">
                    {i + 1}
                  </div>
                  <p className="mt-4 text-xs font-medium text-indigo-400">{j.year}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{j.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                    {j.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="text-indigo-400">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's the plan */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-500/15 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Our Big Focus</p>
                <h2
                  className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
                >
                  What&apos;s the plan?
                </h2>
                <p className="mt-6 text-zinc-400">
                  We&apos;re doubling down on what makes LinkHexa different: speed, transparency, and global reach. Our roadmap is built around your success.
                </p>
                <ul className="mt-6 space-y-3">
                  {planPoints.map((point) => (
                    <li key={point} className="flex gap-3 text-zinc-400">
                      <span className="mt-0.5 shrink-0 text-indigo-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative aspect-[9/16] max-h-[400px] w-full max-w-[280px] justify-self-center overflow-hidden border border-white/10 bg-zinc-900/60 lg:justify-self-end"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                  <svg className="h-16 w-16 text-indigo-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 13h2a2 2 0 002-2V9a2 2 0 00-2-2H3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-between gap-8 border border-white/10 bg-zinc-900/80 p-8 sm:flex-row sm:p-12"
            >
              <div>
                <h2
                  className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                  style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
                >
                  Ready to grow with us?
                </h2>
                <p className="mt-2 text-zinc-400">
                  Join thousands of advertisers and publishers already on LinkHexa.
                </p>
                <ul className="mt-4 space-y-2">
                  {["Expert advice for publishers", "Partner support when you need it"].map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-zinc-400">
                      <span className="text-indigo-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/#contact"
                className="shrink-0 bg-indigo-600 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Get started now
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
