"use client";

import { motion } from "framer-motion";
import { AnimatedOutlineButton } from "@/components/ui/AnimatedOutlineButton";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28"
    >
      {/* Animated background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-sm font-medium uppercase tracking-widest text-indigo-400"
          >
            The future of business automation
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
          >
            Build, ship, and scale{" "}
            <span className="gradient-text mt-2 block">faster than ever</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-zinc-400 sm:text-xl"
          >
            One platform to automate workflows, connect your tools, and grow your
            revenue. No code required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <AnimatedOutlineButton href="#signup">
              Get started free →
            </AnimatedOutlineButton>
            <AnimatedOutlineButton href="#features">
              Let&apos;s go!
            </AnimatedOutlineButton>
          </motion.div>

          {/* Product mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 sm:mt-20"
          >
            <div className="glass-strong glow-md mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 p-2 shadow-2xl">
              <div className="flex items-center gap-2 rounded-t-lg border-b border-white/5 bg-white/5 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="grid grid-cols-12 gap-4 bg-white/[0.02] p-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    className="col-span-12 rounded-lg border border-white/5 bg-white/5 p-4 sm:col-span-6 lg:col-span-4"
                    whileHover={{ scale: 1.02, borderColor: "rgba(99,102,241,0.3)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="mb-3 h-2 w-1/3 rounded bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-white/5" />
                      <div className="h-2 w-4/5 rounded bg-white/5" />
                      <div className="h-2 w-2/3 rounded bg-white/5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
