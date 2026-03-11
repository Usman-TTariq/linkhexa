"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is an affiliate network?",
    answer:
      "An affiliate network is a platform that connects advertisers with publishers. Advertisers list their offers and campaigns; publishers promote them and earn a commission for each sale, lead, or click they generate.",
  },
  {
    question: "Who can join the platform?",
    answer:
      "Both advertisers and publishers can join. Advertisers looking to grow through performance marketing and publishers—including bloggers, influencers, and content creators—who want to monetize their audience are welcome. Sign-up is simple and we support both sides of the partnership.",
  },
  {
    question: "How do publishers earn commissions?",
    answer:
      "Publishers earn a commission when someone from their audience completes a defined action—such as a purchase, sign-up, or lead form—after clicking their unique tracking link. Rates and commission structure are set by each advertiser and shown clearly in the offer details.",
  },
  {
    question: "How are conversions tracked?",
    answer:
      "We use real-time tracking to monitor clicks, conversions, and campaign performance. Every action is attributed accurately, and both advertisers and publishers get transparent, up-to-date reporting.",
  },
  {
    question: "When do publishers receive payments?",
    answer:
      "Payout cycles depend on the advertiser and are listed on each offer. Publishers can usually request payment once they reach the minimum payout threshold. We support multiple payout methods and process requests within the stated cycle (for example, net-30).",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden py-24 sm:py-32">
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
          <p className="mt-4 text-zinc-400">
            Everything you need to know about our platform and affiliate programs.
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
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-white">{faq.question}</span>
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
                    <p className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-zinc-400">
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
