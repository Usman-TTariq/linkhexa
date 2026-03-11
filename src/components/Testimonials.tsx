"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "LinkHexa cut our onboarding time in half. The automation workflows are incredibly intuitive.",
    author: "Sarah Chen",
    role: "Head of Ops",
    company: "TechFlow",
    avatar: "SC",
  },
  {
    quote:
      "We switched from three different tools to LinkHexa. One dashboard, one bill, way less chaos.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "ScaleUp",
    avatar: "MJ",
  },
  {
    quote:
      "The integrations just work. Connected Slack, Stripe, and our CRM in under an hour.",
    author: "Elena Rodriguez",
    role: "Founder",
    company: "Luna Labs",
    avatar: "ER",
  },
];

export default function Testimonials() {
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
            Testimonials
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Loved by teams everywhere
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            See what our customers have to say about automating with LinkHexa.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl border border-white/5 p-6"
            >
              <p className="text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-400">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.author}</p>
                  <p className="text-sm text-zinc-500">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
