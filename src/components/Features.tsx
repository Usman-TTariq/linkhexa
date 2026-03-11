"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    ),
    title: "Live Attribution",
    description:
      "Track clicks, leads, and conversions as they happen. Our system provides accurate attribution so every partner receives proper credit for the results they generate.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    ),
    title: "Reliable Payouts",
    description:
      "Manage commissions and payouts through a reliable payment system. Automated processes and multiple withdrawal options ensure partners receive their earnings smoothly.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    title: "Traffic Integrity",
    description:
      "Advanced security systems monitor traffic quality, detect suspicious activity, and protect campaigns from invalid clicks and fraudulent conversions.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    title: "Borderless Partnerships",
    description:
      "Discover advertisers and publishers from different regions and industries, helping you expand reach and build valuable partnerships worldwide.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
    title: "Performance Intelligence",
    description:
      "Analyze campaign performance with clear reports and insights. Identify top partners, monitor trends, and optimize strategies based on real data.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    ),
    title: "One Dashboard",
    description:
      "Control campaigns, partners, and communications from one centralized dashboard designed to simplify daily affiliate program operations.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32">
      {/* Purple glow on left - same style as Hero */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[300px] w-[300px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute -left-20 bottom-1/4 h-[280px] w-[280px] rounded-full bg-indigo-600/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,rgba(99,102,241,0.12),transparent)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Unique heading: framed title + pill icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <div className="relative inline-flex flex-col items-center gap-5 border-2 border-indigo-400/70 bg-black/40 px-8 py-6 sm:px-12 sm:py-8">
            {/* Pill-shaped accent with subtle shadow */}
            <div
              className="h-2 w-14 rounded-full bg-violet-500/90 shadow-md"
              style={{
                boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
              }}
            />
            <h2
              className="font-display text-2xl font-extrabold tracking-tight text-indigo-400 sm:text-3xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
            >
              Platform Capabilities
            </h2>
          </div>
          <p
            className="mt-5 text-lg font-semibold tracking-wide text-white/90"
            style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "0.01em" }}
          >
            Built for Performance Partnerships
          </p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-400">
            Our platform connects advertisers and publishers through reliable
            technology that simplifies collaboration, tracks results accurately,
            and supports long-term affiliate growth.
          </p>
        </motion.div>

        {/* 2x3 grid of feature cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group glass rounded-2xl border border-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="mb-4 inline-flex bg-indigo-500/10 p-3 text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
