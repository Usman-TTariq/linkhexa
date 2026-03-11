"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden border-2 border-white/10 bg-zinc-900/90 p-8 shadow-[0_0_0_1px_rgba(99,102,241,0.08)] sm:p-12 lg:p-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(99,102,241,0.12),transparent)]" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
            >
              Ready to automate your workflow?
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Join thousands of teams already using LinkHexa. No credit card
              required.
            </p>
            {submitted ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-indigo-400"
              >
                Thanks! We&apos;ll be in touch.
              </motion.p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="min-w-0 flex-1 border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:max-w-sm"
                />
                <button
                  type="submit"
                  className="border-2 border-indigo-500 bg-indigo-600 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500 hover:border-indigo-400"
                >
                  Get early access
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
