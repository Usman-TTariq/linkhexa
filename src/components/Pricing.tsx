"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    monthly: 29,
    yearly: 24,
    description: "Perfect for individuals and side projects",
    features: [
      "Up to 3 team members",
      "5,000 automation runs/month",
      "10 integrations",
      "Email support",
    ],
    cta: "Start free trial",
    href: "/get-started",
    highlighted: false,
  },
  {
    name: "Pro",
    monthly: 79,
    yearly: 65,
    description: "For growing teams that need more power",
    features: [
      "Up to 15 team members",
      "50,000 automation runs/month",
      "Unlimited integrations",
      "Priority support",
      "Custom workflows",
      "Advanced analytics",
    ],
    cta: "Get started",
    href: "/get-started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthly: 199,
    yearly: 165,
    description: "For organizations with advanced needs",
    features: [
      "Unlimited team members",
      "Unlimited runs",
      "SSO & SAML",
      "Dedicated success manager",
      "SLA guarantee",
      "Custom contracts",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlighted: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Start free. Scale as you grow. No hidden fees.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
            <span
              className={`text-sm font-medium ${
                !yearly ? "text-white" : "text-zinc-500"
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly(!yearly)}
              className="relative h-7 w-12 rounded-full bg-white/10 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <motion.span
                className="absolute left-1 top-1 h-5 w-5 rounded-full bg-indigo-500"
                animate={{ x: yearly ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                yearly ? "text-white" : "text-zinc-500"
              }`}
            >
              Yearly
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              Save 20%
            </span>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-4 sm:p-6 lg:p-8 ${
                plan.highlighted
                  ? "glass-strong border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "glass border-white/5"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </div>
              )}
              <h3 className="text-lg font-semibold text-white sm:text-xl">{plan.name}</h3>
              <p className="mt-1.5 text-xs text-zinc-400 sm:mt-2 sm:text-sm">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1 sm:mt-6">
                <span className="text-3xl font-bold text-white sm:text-4xl">
                  ${yearly ? plan.yearly : plan.monthly}
                </span>
                <span className="text-zinc-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-400"
                  >
                    <svg
                      className="h-5 w-5 shrink-0 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-all sm:mt-8 sm:py-3 ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "border border-white/10 text-white hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
