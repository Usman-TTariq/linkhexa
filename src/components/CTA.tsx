"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden border-2 border-white/10 bg-zinc-900/90 p-6 shadow-[0_0_0_1px_rgba(99,102,241,0.08)] sm:p-10 lg:p-16"
        >
          <div className="absolute inset-0">
            <Image
              src="/meeting-background-o9k6b5wkuevvy1f7.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-zinc-950/85" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
            >
              Ready to automate your workflow?
            </h2>
            <p className="mt-3 text-base text-zinc-400 sm:mt-4 sm:text-lg">
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
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4 sm:justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="min-w-0 flex-1 border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:max-w-sm sm:py-3.5"
                />
                <button
                  type="submit"
                  className="w-full border-2 border-indigo-500 bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 hover:border-indigo-400 sm:w-auto sm:px-8 sm:py-3.5"
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
