"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create your partner account",
    description:
      "Sign up as a publisher or advertiser in seconds and start building profitable partnerships.",
  },
  {
    number: "02",
    title: "Submit your information",
    description:
      "Provide your details, website, and payment info so we can verify your account and set you up for campaigns.",
  },
  {
    number: "03",
    title: "Choose campaigns or partners",
    description:
      "Publishers pick campaigns to earn, and advertisers connect with publishers to drive performance.",
  },
  {
    number: "04",
    title: "Drive sales and revenue",
    description:
      "Publishers earn by promoting campaigns, and advertisers grow their business through performance partnerships.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Purple disperse spots - left & right */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[280px] w-[280px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute right-0 bottom-1/3 h-[280px] w-[280px] rounded-full bg-violet-500/12 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
        {/* Link / Hexa - boundaries ke andar, fade effect */}
        <div
          className="absolute left-0 top-0 flex h-full w-[min(28%,220px)] items-center pl-4 sm:pl-6 md:pl-8"
          style={{
            maskImage: "linear-gradient(to right, black 20%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 100%)",
          }}
        >
          <span
            className="text-5xl font-bold tracking-tight text-black sm:text-6xl md:text-7xl"
            style={{
              fontFamily: "var(--font-libre-baskerville), serif",
              letterSpacing: "-0.03em",
              opacity: 0.35,
            }}
          >
            Link
          </span>
        </div>
        <div
          className="absolute right-0 top-0 flex h-full w-[min(28%,220px)] items-center justify-end pr-4 sm:pr-6 md:pr-8"
          style={{
            maskImage: "linear-gradient(to left, black 20%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 20%, transparent 100%)",
          }}
        >
          <span
            className="text-5xl font-bold tracking-tight text-black sm:text-6xl md:text-7xl"
            style={{
              fontFamily: "var(--font-libre-baskerville), serif",
              letterSpacing: "-0.03em",
              opacity: 0.35,
            }}
          >
            Hexa
          </span>
        </div>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 sm:text-sm">
            How it works
          </p>
          <h2
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--font-libre-baskerville), serif", letterSpacing: "-0.02em" }}
          >
            Get started in 4 simple steps
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            From registration to earning or launching campaigns in just minutes.
          </p>
        </motion.div>

        <div className="mt-8 sm:mt-10">
          <div className="relative">
            {/* Timeline line - hidden on mobile, visible from md up */}
            <div className="absolute left-5 top-0 bottom-0 hidden w-px bg-gradient-to-b from-indigo-500/50 via-indigo-500/30 to-transparent sm:left-6 md:block md:left-1/2 md:-translate-x-px" />

            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {steps.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative flex flex-col items-center gap-4 md:flex-row ${
                      !isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex w-full max-w-md flex-1 flex-col items-center md:items-end md:pr-10 ${
                        !isEven ? "md:items-start md:pl-10 md:pr-0" : ""
                      }`}
                    >
                      <div
                        className={`glass rounded-xl border border-white/5 p-4 text-center md:text-left ${
                          !isEven ? "md:text-right" : ""
                        }`}
                      >
                        <span className="text-xs font-medium text-indigo-400">
                          Step {step.number}
                        </span>
                        <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">{step.description}</p>
                      </div>
                    </div>

                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500 bg-[var(--background)]">
                      <span className="text-sm font-bold text-indigo-400">
                        {step.number}
                      </span>
                    </div>

                    <div className="hidden w-full max-w-md flex-1 md:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
