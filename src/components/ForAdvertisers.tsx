"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const whyTrustUs = [
  {
    title: "Verified Publisher Network",
    description:
      "Access a curated selection of trusted publishers who reach the right audience and drive meaningful traffic.",
  },
  {
    title: "Real-Time Analytics",
    description:
      "Track every click, lead, and sale in real time so you can make smarter campaign decisions on the fly.",
  },
  {
    title: "Secure & Transparent",
    description:
      "Protect your campaigns from fraud with built-in monitoring that ensures authentic traffic and reliable ROI.",
  },
];

const serviceTags = [
  "Performance marketing",
  "CPA & CPL",
  "Brand awareness",
  "Retargeting",
  "Influencer campaigns",
  "Global reach",
];

const stats = [
  { value: "30K+", label: "Advertisers", numeric: 30000, suffix: "K+", prefix: "" },
  { value: "18,420", label: "Active offers", numeric: 18420, suffix: "", prefix: "" },
  { value: "$5M+", label: "Annual revenue", numeric: 5, suffix: "M+", prefix: "$" },
];

/** Count-up animation when in view */
function AnimatedStat({
  numeric,
  prefix,
  suffix,
  label,
  duration = 1.5,
}: {
  numeric: number;
  prefix: string;
  suffix: string;
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
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, numeric, duration]);

  const formatted =
    prefix +
    (suffix === "K+"
      ? (display / 1000).toFixed(0) + "K+"
      : suffix === "M+"
        ? String(display) + "M+"
        : display.toLocaleString() + suffix);

  return (
    <div ref={ref} className="glass rounded-2xl border border-white/5 p-4 text-center transition-all hover:-translate-y-1 hover:border-indigo-500/20 sm:p-6">
      <p className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{formatted}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

/** Simple line chart placeholder (CSS) */
function BudgetChart() {
  const points = "0,60 20,45 40,55 60,35 80,50 100,25";
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-300">Budget ($/Day)</p>
      <div className="h-24 w-full">
        <svg viewBox="0 0 100 60" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>Jan</span>
        <span>Dec</span>
      </div>
    </div>
  );
}

/** Simple bar chart placeholder */
function TrafficChart() {
  const heights = [30, 45, 55, 70, 85, 100];
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-300">Generated Traffic & Leads</p>
      <div className="flex h-24 items-end justify-between gap-1">
        {heights.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-indigo-500/60 transition-colors hover:bg-indigo-500/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ForAdvertisers() {
  return (
    <section id="advertisers" className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Soft glow right side */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:gap-14">
          {/* Left: Chart cards - slightly narrower column, lighter card bg */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-sm"
            >
              <BudgetChart />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-sm"
            >
              <TrafficChart />
            </motion.div>
          </div>

          {/* Right: Our Advertisers - wider column, image-style layout */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/25 text-indigo-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Our <span className="border-b-2 border-indigo-400 pb-0.5">advertisers</span>
                </h2>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 text-sm leading-relaxed text-zinc-400 sm:mt-6 sm:text-base"
            >
              For Advertisers — Partner with performance-driven brands. Grow your business with campaigns designed to deliver measurable results. Our platform connects you with high-quality publishers, gives you actionable insights, and makes your marketing budget work harder.
            </motion.p>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400/90 sm:mt-10">
              Why brands trust us
            </p>
            <ul className="mt-5 space-y-6">
              {whyTrustUs.map((item, i) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                  <div>
                    <span className="font-bold text-indigo-400">{item.title}</span>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{item.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Service tags - wrapped grid inside one card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-16"
        >
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:mb-4 sm:text-sm">
            Campaign types
          </p>
          <div className="glass rounded-2xl border border-white/5 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {serviceTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats row - count-up + hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6"
        >
          {stats.map((stat) => (
            <AnimatedStat
              key={stat.label}
              numeric={stat.numeric}
              prefix={stat.prefix}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
