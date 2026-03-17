"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CTA() {
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
              Forge Valuable Partnerships Today
            </h2>
            <p className="mt-3 text-base text-zinc-400 sm:mt-4 sm:text-lg">
              Join a dynamic affiliate platform where advertisers, publishers, and creators collaborate to expand reach, boost performance, and unlock new revenue opportunities.
            </p>
            <Link
              href="/get-started"
              className="mt-6 inline-block w-full border-2 border-indigo-500 bg-indigo-600 px-8 py-3.5 text-center font-semibold text-white transition-colors hover:bg-indigo-500 hover:border-indigo-400 sm:mt-8 sm:w-auto sm:px-10"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
