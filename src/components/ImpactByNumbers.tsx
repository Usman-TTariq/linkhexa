"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const topMetrics = [
  { label: "Premium Stores", numeric: 15000, format: "k+" },
  { label: "Countries", numeric: 50, format: "+" },
  { label: "Daily sales", numeric: 110, format: "$K" },
];

const statCards = [
  { label: "Sales every day", numeric: 110, format: "$K" },
  { label: "Premium Stores", numeric: 15000, format: "k+" },
  { label: "Countries", numeric: 50, format: "+" },
  { label: "Advertisers", numeric: 30000, format: "K+" },
  { label: "Active publishers", numeric: 1500, format: "1.5K+" },
  { label: "Avg days to first conversion", numeric: 1, format: "1" },
];

function formatAnimated(display: number, format: string): string {
  switch (format) {
    case "k+":
      return (display / 1000).toFixed(0) + "k+";
    case "+":
      return display + "+";
    case "$K":
      return "$" + display + "K";
    case "K+":
      return (display / 1000).toFixed(0) + "K+";
    case "1.5K+":
      return (display / 1000).toFixed(1) + "K+";
    case "1":
      return String(display);
    default:
      return String(display);
  }
}

function AnimatedNumber({
  numeric,
  format,
  label,
  duration = 1.5,
}: {
  numeric: number;
  format: string;
  label: string;
  duration?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const end = numeric;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, numeric, duration]);

  return (
    <div ref={ref}>
      <p className="text-2xl font-bold text-white sm:text-3xl">{formatAnimated(display, format)}</p>
      <p className="mt-0.5 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function AnimatedStatCard({
  numeric,
  format,
  label,
  duration = 1.5,
}: {
  numeric: number;
  format: string;
  label: string;
  duration?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const end = numeric;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, numeric, duration]);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-white/5 bg-zinc-900/60 p-5 text-center backdrop-blur-sm transition-all hover:border-indigo-500/20"
    >
      <p className="text-2xl font-bold text-indigo-400 sm:text-3xl">{formatAnimated(display, format)}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function TrendLineChart() {
  const points = "0,48 18,42 36,36 54,30 72,22 100,14";
  const areaPath = `M0,60 L0,48 L18,42 L36,36 L54,30 L72,22 L100,14 L100,60 Z`;
  return (
    <div className="mt-6 space-y-2">
      <div className="h-24 w-full">
        <svg viewBox="0 0 100 60" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="impactLineGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0)" />
            </linearGradient>
            <linearGradient id="impactStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path fill="url(#impactLineGrad)" d={areaPath} />
          <polyline
            fill="none"
            stroke="url(#impactStroke)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
      <p className="text-xs text-zinc-500">Trend — Last 12 months</p>
    </div>
  );
}

export default function ImpactByNumbers() {
  return (
    <section id="impact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(99,102,241,0.06),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.45fr_0.55fr] lg:gap-14">
          {/* Left: Global Metrics card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-sm sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Global Metrics
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {topMetrics.map((m) => (
                <AnimatedNumber
                  key={m.label}
                  numeric={m.numeric}
                  format={m.format}
                  label={m.label}
                  duration={1.4}
                />
              ))}
            </div>
            <TrendLineChart />
          </motion.div>

          {/* Right: Impact by the numbers */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2"
            >
              <span className="text-indigo-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </span>
              <span
                className="rounded-2xl border-2 border-indigo-400/70 bg-black/30 px-5 py-2.5 text-2xl font-bold tracking-tight text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
              >
                Impact by the numbers
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 text-base leading-relaxed text-zinc-400"
            >
              From premium brands to high-performing publishers, our platform powers global partnerships. Leverage live insights, track performance, and grow your business with measurable results every single day.
            </motion.p>
          </div>
        </div>

        {/* Bottom: 6 stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {statCards.map((card) => (
            <AnimatedStatCard
              key={card.label}
              numeric={card.numeric}
              format={card.format}
              label={card.label}
              duration={1.4}
            />
          ))}
        </motion.div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Real-time data, updated daily
        </p>
      </div>
    </section>
  );
}
