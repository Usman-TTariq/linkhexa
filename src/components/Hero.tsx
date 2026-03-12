"use client";

import { motion } from "framer-motion";
import { AnimatedOutlineButton } from "@/components/ui/AnimatedOutlineButton";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28"
    >
      {/* Animated background glow + purple spots with Link / Hexa */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        {/* Purple spots – left & right */}
        <div className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[280px] w-[280px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute right-0 bottom-1/3 h-[280px] w-[280px] rounded-full bg-violet-500/12 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
        {/* Link – left */}
        <div
          className="absolute left-0 top-0 flex h-full w-[min(28%,220px)] items-center pl-4 sm:pl-6 md:pl-8"
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
        {/* Hexa – right */}
        <div
          className="absolute right-0 top-0 flex h-full w-[min(28%,220px)] items-center justify-end pr-4 sm:pr-6 md:pr-8"
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
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-sm font-medium uppercase tracking-widest text-indigo-400"
          >
            Better Partnerships, Greater Growth.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
          >
            Partner, track, and{" "}
            <span className="whitespace-nowrap text-indigo-400">grow with Partnerships.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base text-zinc-400 sm:mt-6 sm:text-lg lg:text-xl"
          >
            Connect with top publishers and brands. Build partnerships that grow revenue.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:gap-4 sm:flex-row"
          >
            <AnimatedOutlineButton href="/get-started">
              Get Started
            </AnimatedOutlineButton>
            <AnimatedOutlineButton href="/contact">
              Contact
            </AnimatedOutlineButton>
          </motion.div>

          {/* Product mockup – infographic video */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 sm:mt-20"
          >
            <div className="glass-strong glow-md mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 p-2 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="relative aspect-[21/9] max-h-[280px] bg-black sm:max-h-[320px]">
                <video
                  src="/2318084_Business_Infographics_1920x1080.mp4"
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  title="LinkHexa – Business infographics"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
