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
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:p-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {logos.map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex h-16 w-full items-center justify-center rounded-2xl border border-white/5 bg-zinc-800/80 text-center text-sm font-medium text-zinc-300 shadow-sm transition-all hover:border-indigo-400/50 hover:text-white hover:shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
                >
                  {name}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
