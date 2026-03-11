"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const pressLogos = [
  { src: "/bloomberg-pr.png", alt: "Bloomberg" },
  { src: "/yahoo-pr.png", alt: "Yahoo!" },
  { src: "/marketwatch-pr.png", alt: "MarketWatch" },
  { src: "/businessinsider-pr.png", alt: "Business Insider" },
  { src: "/asiaone-pr.png", alt: "AsiaOne" },
  { src: "/digitaljournal-pr.png", alt: "Digital Journal" },
];

const steps = [
  { num: "01", title: "Sign up & onboard", desc: "Create your advertiser account, complete verification, and get access to our partner dashboard. Most brands go live within 48 hours." },
  { num: "02", title: "Create your offers", desc: "Set up campaigns with your commission structure (CPA, CPS, CPL, or hybrid). Define tracking links, caps, and payouts to match your goals." },
  { num: "03", title: "Connect with publishers", desc: "Our vetted publisher network can apply to your program. Approve partners that fit your niche and start driving qualified traffic." },
  { num: "04", title: "Track, optimize & scale", desc: "Use real-time reporting to see clicks, conversions, and ROI. Optimize offers and scale with top-performing publishers." },
];

const programTypes = [
  { title: "CPA (Cost per action)", desc: "Pay only when a user completes a defined action—sale, lead, sign-up, or download. Ideal for measurable ROI." },
  { title: "CPS (Cost per sale)", desc: "Commission on every sale referred by a publisher. The most common model for e-commerce and direct response." },
  { title: "CPL (Cost per lead)", desc: "Pay per qualified lead. Perfect for B2B, insurance, finance, and any business where lead quality matters." },
  { title: "CPI (Cost per install)", desc: "Pay per app install or software trial. Suited for mobile apps, SaaS, and product trials." },
  { title: "Rev share", desc: "Share a percentage of recurring revenue with publishers. Great for subscriptions and long-term customer value." },
  { title: "Hybrid & custom", desc: "Combine models or set custom rules. We support tiered commissions, bonuses, and seasonal campaigns." },
];

const industries = [
  { title: "E-commerce & retail", desc: "Drive sales with coupon sites, content creators, and comparison engines." },
  { title: "Finance & insurance", desc: "Quality leads from comparison and review sites with full compliance support." },
  { title: "SaaS & software", desc: "Trial sign-ups and subscriptions via tech bloggers and B2B publishers." },
  { title: "Travel & hospitality", desc: "Bookings and package sales through travel affiliates and influencers." },
  { title: "Health & wellness", desc: "Supplement, fitness, and wellness brands with compliant publisher networks." },
  { title: "Education & courses", desc: "Student sign-ups and course sales through education and lifestyle publishers." },
];

const whyChoose = [
  { title: "Innovative partnership", desc: "Reach your audience globally through a large partner database and diverse channels." },
  { title: "Product-related search", desc: "Publishers run PLAs with detailed info that drives qualified traffic to your site." },
  { title: "Social presence", desc: "Creators and influencers monetize their reach—you pay only for results." },
  { title: "Analytics dashboard", desc: "Full visibility into performance and ROI so you can optimize and scale." },
];

const differentiators = [
  { title: "User-friendly", desc: "Platform is easy to use and onboard." },
  { title: "Cost-effective", desc: "Pay commission only after sale." },
  { title: "High-quality", desc: "High-quality publisher base and data." },
  { title: "Monitoring", desc: "Performance monitoring and reports." },
  { title: "Relationship", desc: "Dedicated relationship managers." },
  { title: "Optimize", desc: "Optimize with detailed reporting." },
];

const faqs = [
  { q: "How quickly can I launch my affiliate program?", a: "Most advertisers are live within 24–48 hours after completing verification. You can create offers, set commission structures, and invite or approve publishers as soon as your account is active." },
  { q: "What commission models do you support?", a: "We support CPA, CPS, CPL, CPI, revenue share, and hybrid or custom models. You can set tiered commissions, bonuses, and seasonal campaigns." },
  { q: "How do I know my traffic and conversions are real?", a: "We use real-time tracking, fraud detection, and quality controls. You get publisher-level performance breakdown and full visibility into clicks and conversions." },
  { q: "Is there a minimum spend or contract?", a: "We keep terms flexible. Get in touch with our team for details tailored to your business size and goals." },
  { q: "Can I work with specific publishers only?", a: "Yes. You can invite preferred publishers or approve only those that match your niche from our network." },
];

export default function AdvertisersContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pb-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[120px]" />
            <div className="absolute right-1/4 top-1/2 h-[350px] w-[350px] rounded-full bg-violet-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div>
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium uppercase tracking-widest text-indigo-400">For brands & merchants</motion.p>
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Grow with the right partnership</motion.h1>
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 max-w-xl text-base text-zinc-400 sm:text-lg">Not on LinkHexa yet? You’re missing scale. Connect with quality publishers, pay only for performance, and track every sale in real time.</motion.p>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap gap-4">
                  <Link href="/get-started" className="rounded-lg bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500">Get started as advertiser</Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 grid grid-cols-3 gap-4">
                  {["80%", "90%", "99%"].map((val, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-indigo-400 sm:text-3xl">{val}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{i === 0 ? "Sales lift" : i === 1 ? "Traffic" : "Uptime"}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  <Image src="/meeting-background-o9k6b5wkuevvy1f7.jpg" alt="Team collaboration" width={600} height={400} className="aspect-[3/2] w-full object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* As seen on */}
        <section className="border-y border-white/10 bg-zinc-800/60 py-6 sm:py-8">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-indigo-400">As seen on</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {pressLogos.map((logo) => (
              <div key={logo.alt} className="flex h-8 w-24 items-center justify-center opacity-80 sm:h-9 sm:w-28">
                <Image src={logo.src} alt={logo.alt} width={112} height={36} className="h-full w-full object-contain" />
              </div>
            ))}
          </div>
        </section>

        {/* Millions of opportunities */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="relative order-2 lg:order-1">
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                  <Image src="/639b7845e9be869771e540b8_mural-blog-images.jpg" alt="Data and analytics" width={560} height={380} className="aspect-[4/3] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Opens up millions of opportunities</h2>
                <p className="mt-4 text-zinc-400">LinkHexa gives you the ease to start, plus industry expertise and actionable data. Scale with a partner network built for performance.</p>
                <p className="mt-4 text-zinc-400">Whether you’re a growing D2C brand or an established retailer, our network opens doors to new audiences without the risk of upfront ad spend. You scale only when you see results.</p>
                <ul className="mt-6 space-y-3">
                  {["Reliable traffic from vetted publishers", "Real-time reporting and conversion tracking", "Optimize offers and scale with top performers", "Cost-effective: pay commission only when traffic converts"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Simple process</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>How it works for advertisers</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">From sign-up to scale in four straightforward steps.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                  <span className="text-2xl font-bold text-indigo-400">{step.num}</span>
                  <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Program types */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Flexible models</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Program types we support</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Choose the compensation model that fits your business.</p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programTypes.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/3 h-[300px] w-[300px] rounded-full bg-violet-500/12 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(99,102,241,0.06),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Who we work with</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Industries we serve</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">From retail to SaaS, we help brands across sectors acquire customers through trusted publisher partnerships.</p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {industries.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* We deliver success - image left, stats right */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.1),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <Image src="/Happy-work-team-cheering-and-celebrating-at-meeting-team-collaboration.jpg" alt="Team delivering success" width={560} height={400} className="aspect-[4/3] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>We deliver success</h2>
                <p className="mt-4 text-zinc-400">Join a large network of affiliates and take your marketing to the next level with real tracking and payouts.</p>
                <p className="mt-4 text-zinc-400">Our advertisers see measurable lifts in sales, traffic, and revenue when they partner with the right publishers. We focus on transparency and long-term partnerships.</p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { val: "80%", label: "Increased sales" },
                    { val: "90%", label: "Increased traffic" },
                    { val: "99%", label: "Uptime" },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-center">
                      <p className="text-2xl font-bold text-indigo-400 sm:text-3xl">{stat.val}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dare to make the right choice */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-violet-500/12 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Dare to make the right choice</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Connect with quality publishers and scale your affiliate program with real tracking and payouts.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {whyChoose.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What makes us different - 6 grid with image section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="absolute inset-0 bg-zinc-900/30" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>What makes us different?</h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {differentiators.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Performance-first + image */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Performance-first</h2>
                <p className="mt-4 text-lg font-medium text-indigo-400">Real ROI. No wasted spend.</p>
                <p className="mt-4 text-zinc-400">Unlike fixed CPM or CPC deals, affiliate marketing ties your spend directly to results. You pay only when a sale, lead, or install happens—so every dollar is accountable.</p>
                <p className="mt-4 text-zinc-400">Our platform gives you full visibility: real-time clicks, conversion tracking, and detailed reports by publisher and campaign. No black boxes. You see exactly who drives value.</p>
                <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                  {["Real-time conversion and click reporting", "Publisher-level performance breakdown", "Fraud detection and quality controls", "Flexible payment terms and invoicing"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <Image src="/young-business-people-meeting-office-teamwork-group-success-corporate-discussion_565246-1628.avif" alt="Performance and reporting" width={560} height={380} className="aspect-[4/3] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="relative overflow-hidden py-12 sm:py-16">
          <div className="absolute inset-0 bg-zinc-900/50" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Why advertisers trust us</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { val: "30k+", label: "Active advertisers" },
                { val: "18,420+", label: "Live offers" },
                { val: "$5M+", label: "Annual affiliate revenue tracked" },
                { val: "30", label: "Avg. days to first conversion" },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center">
                  <p className="text-3xl font-bold text-indigo-400">{stat.val}</p>
                  <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Support</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Frequently asked questions</h2>
            <div className="mt-10 space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/40 overflow-hidden">
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="font-semibold text-white">{faq.q}</span>
                    <span className={`shrink-0 text-indigo-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </button>
                  {openFaq === i && <div className="border-t border-white/5 px-5 py-4 text-sm text-zinc-400">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Ready to grow with performance marketing?</h2>
            <p className="mt-4 text-zinc-400">Become part of a powerful affiliate platform where advertisers, publishers, and creators work together to grow audiences, drive performance, and create new earning opportunities.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/get-started" className="rounded-lg bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500">Create advertiser account</Link>
              <Link href="/contact" className="rounded-lg border-2 border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10">Talk to sales</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
