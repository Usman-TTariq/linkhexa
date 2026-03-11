"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const whyChooseUs = [
  {
    title: "Trusted Brand Partnerships",
    description:
      "Connect with premium brands and campaigns that match your audience. We vet every advertiser so you promote with confidence.",
  },
  {
    title: "Live Performance Insights",
    description:
      "Track clicks, leads, and conversions in real time. See what works and optimize your content strategy with clear, actionable data.",
  },
  {
    title: "Fast & Secure Payouts",
    description:
      "Receive payments quickly and reliably. Multiple withdrawal options and transparent reporting so you always know where you stand.",
  },
];

const stats = [
  { value: "1.5K+", label: "Active publishers", numeric: 1500, suffix: "K+", prefix: "" },
  { value: "18,420", label: "Active offers", numeric: 18420, suffix: "", prefix: "" },
  { value: "30 days", label: "Avg. payout cycle", numeric: 30, suffix: " days", prefix: "" },
];

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
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, numeric, duration]);

  const formatted =
    prefix +
    (suffix === "K+"
      ? (display / 1000).toFixed(1) + "K+"
      : suffix === " days"
        ? display + " days"
        : display.toLocaleString() + suffix);

  return (
    <div ref={ref} className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4 text-center backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-indigo-500/20 sm:p-6">
      <p className="text-2xl font-bold text-indigo-400 sm:text-3xl lg:text-4xl">{formatted}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function PublisherLineChart() {
  const points = "0,55 15,48 30,52 45,40 60,45 75,35 100,28";
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-300">Budget ($/Day)</p>
      <div className="h-20 w-full">
        <svg viewBox="0 0 100 60" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pubLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="url(#pubLineGrad)"
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

function PublisherBarChart() {
  const heights = [35, 50, 60, 75, 88, 100];
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-300">Generated Traffic & Leads</p>
      <div className="flex h-20 items-end justify-between gap-1">
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

export default function ForPublishers() {
  return (
    <section id="publishers" className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Glow - left side this time for layout variation */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-[320px] w-[320px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.08),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Layout: Right = charts, Left = text (swapped vs For Advertisers) */}
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[0.58fr_0.42fr] lg:gap-14">
          {/* Left: For Publishers content */}
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/25 text-indigo-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  For <span className="border-b-2 border-indigo-400 pb-0.5">Publishers</span>
                </h2>
              </div>
            </motion.div>
            <p
              className="mt-3 text-base font-medium text-zinc-300 sm:text-lg"
              style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
            >
              Monetize Your Content with Ease
            </p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 text-sm leading-relaxed text-zinc-400 sm:mt-5 sm:text-base"
            >
              Turn your audience into revenue. Partner with trusted brands, track every conversion, and get paid on time. Our platform is built to help publishers grow with clear insights and reliable payouts.
            </motion.p>

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400/90">
              Why publishers choose us
            </p>
            <ul className="mt-4 space-y-4 sm:mt-5 sm:space-y-6">
              {whyChooseUs.map((item, i) => (
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

          {/* Right: Chart cards */}
          <div className="order-1 space-y-5 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-sm"
            >
              <PublisherLineChart />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-sm"
            >
              <PublisherBarChart />
            </motion.div>
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 grid gap-6 sm:grid-cols-3"
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
