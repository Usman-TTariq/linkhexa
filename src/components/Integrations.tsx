"use client";

import { motion } from "framer-motion";

const logos = [
  "Slack",
  "Gmail",
  "Stripe",
  "Notion",
  "Figma",
  "GitHub",
  "Salesforce",
  "HubSpot",
  "Zapier",
  "Discord",
  "Google",
  "Microsoft",
];

function MarqueeRow({ direction = "left" }: { direction?: "left" | "right" }) {
  const duplicated = [...logos, ...logos];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max gap-4 ${direction === "right" ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {duplicated.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex h-16 min-w-[140px] shrink-0 items-center justify-center border border-white/5 bg-zinc-800/80 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-indigo-400/50 hover:text-white"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Integrations
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Works with the tools you already use
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Connect 100+ apps and automate workflows across your entire stack.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="overflow-hidden border border-white/5 bg-zinc-900/50 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:p-8">
            <div className="flex flex-col gap-4">
              <MarqueeRow direction="left" />
              <MarqueeRow direction="right" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
