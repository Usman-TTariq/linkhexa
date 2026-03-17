"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "1. What is LinkHexa?",
    answer:
      "LinkHexa is a performance-driven affiliate marketing network that connects advertisers with trusted publishers. Our platform helps brands grow through measurable campaigns and enables publishers to monetize their content effectively.",
  },
  {
    question: "2. How is campaign performance tracked?",
    answer:
      "We provide real-time analytics for every click, lead, and conversion. This allows you to monitor performance instantly, identify top partners, and optimize campaigns with actionable insights.",
  },
  {
    question: "3. How do payouts work?",
    answer:
      "Our platform offers reliable, automated payouts with multiple withdrawal options. Partners are paid on time, and transparent reporting ensures you always know your earnings.",
  },
  {
    question: "4. How does LinkHexa prevent fraud?",
    answer:
      "We use advanced security and traffic-monitoring systems to detect suspicious activity. This protects campaigns from invalid clicks, fraudulent conversions, and ensures ROI integrity.",
  },
  {
    question: "5. Can I manage everything from one dashboard?",
    answer:
      "Yes. LinkHexa provides a centralized dashboard where you can control campaigns, partners, and communications, simplifying daily operations and affiliate program management.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(99,102,241,0.06),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            FAQ
          </p>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
          >
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
            Discover How LinkHexa and Our Affiliate Programs Can Work for You
          </p>
        </motion.div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm transition-colors hover:border-white/10"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:gap-4 sm:px-5 sm:py-4"
              >
                <span className="text-left text-sm font-semibold text-white sm:text-base">{faq.question}</span>
                <span
                  className={`shrink-0 text-indigo-400 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-400 sm:px-5 sm:py-4">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
