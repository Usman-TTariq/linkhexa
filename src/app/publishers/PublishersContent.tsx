"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroLogoCarousel from "@/components/HeroLogoCarousel";
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
  { num: "01", title: "Sign up free", desc: "Set up your publisher account in minutes. Share details about your site or channel; most applications get a decision within 24–48 hours." },
  { num: "02", title: "Browse & apply to offers", desc: "Explore thousands of offers by category, commission type, and brand. Apply to programs that fit your audience and receive approval from advertisers." },
  { num: "03", title: "Share links & creatives", desc: "Get tracking links, banners, and promo codes from your dashboard. Use our deep link generator and API for custom integration when needed." },
  { num: "04", title: "Earn & get paid", desc: "Monitor clicks and conversions in real time. When you reach the payout threshold, receive payments weekly via bank, PayPal, or other options." },
];

const waysToEarn = [
  { title: "Commission per sale (CPS)", desc: "Earn a share or fixed amount each time someone purchases through your link. Suits product reviews, deal sites, and e-commerce content." },
  { title: "Cost per lead (CPL)", desc: "Get paid for each qualified lead—sign-up, quote request, or form submit. Ideal for finance, insurance, and B2B content." },
  { title: "Cost per action (CPA)", desc: "Earn when users complete a specific action: trial sign-up, app install, or subscription. Fits SaaS, apps, and subscription brands." },
  { title: "Rev share", desc: "Ongoing commission on recurring revenue. Best if you promote subscriptions or membership products and want long-term earnings." },
  { title: "Coupons & promo codes", desc: "Share exclusive codes and earn when your audience uses them at checkout. Popular with deal and coupon sites." },
  { title: "Hybrid & bonuses", desc: "Many programs mix models or offer bonus tiers when you hit targets. Higher volume often means better rates." },
];

const categories = [
  { title: "E-commerce & retail", desc: "Fashion, electronics, home—earn on every sale you refer." },
  { title: "Finance & insurance", desc: "High CPL offers for loans, insurance, and credit products." },
  { title: "Travel & booking", desc: "Hotels, flights, packages—commission per booking." },
  { title: "Health & wellness", desc: "Supplements, fitness, and wellness brands with recurring commissions." },
  { title: "Software & SaaS", desc: "Trials and subscriptions with CPA or rev share." },
  { title: "Education & courses", desc: "Online courses, certifications, and learning platforms." },
  { title: "Telecom & utilities", desc: "Broadband, mobile, and energy switching offers." },
  { title: "Gaming & apps", desc: "App installs and in-game offers with CPI and CPA." },
];

const publisherTools = [
  { title: "Tracking links", desc: "Generate unique links per offer and campaign. Use deep links for app and category pages." },
  { title: "Banners & creatives", desc: "Download ready-made banners, text links, and product feeds. Coupon and promo code lists included." },
  { title: "Reports & analytics", desc: "Clicks, conversions, and earnings in real time. Export by date, offer, and traffic source." },
  { title: "API & deep links", desc: "Integrate with your site or app. Build custom links and automate reporting via our API." },
];

const payoutPoints = [
  "Weekly payout runs",
  "Low minimum threshold",
  "Bank transfer, PayPal & more",
  "Clear pending vs. approved breakdown",
];

const whoCanJoin = [
  { title: "Content & bloggers", desc: "Reviews, guides, articles. Turn traffic into affiliate earnings with simple links." },
  { title: "Coupons & deals", desc: "Share discounts and promo codes. Earn when your audience clicks and buys." },
  { title: "Social & influencers", desc: "Monetize your following. Creators earn with every sale they drive." },
];

const perks = [
  { title: "Quick approval", desc: "Get approved fast. Start promoting within 24–48 hours." },
  { title: "Real-time tracking", desc: "Clicks, conversions, earnings—live. No delayed reports." },
  { title: "Flexible payouts", desc: "Weekly payouts. No hoops, no blocking minimums." },
  { title: "Dedicated support", desc: "Publisher-specific support. Real humans, real help." },
];

const faqs = [
  { q: "How long does publisher approval take?", a: "Most applications are reviewed within 24–48 hours. Some advertisers may take a bit longer. You’ll get an email when you’re approved, and you can start grabbing links and creatives right away." },
  { q: "Is there a minimum traffic requirement?", a: "We welcome publishers of all sizes. Some programs may have their own criteria; you can see requirements in the offer details before applying." },
  { q: "When and how do I get paid?", a: "We run weekly payout cycles. Once your balance meets the minimum and is approved, you can choose bank transfer, PayPal, or other methods depending on your region." },
  { q: "Can I promote the same offer on multiple sites?", a: "Yes, unless a specific program’s terms say otherwise. Check each offer’s rules in your dashboard." },
  { q: "Do you offer deep links and API access?", a: "Yes. Use our deep link generator for app and category pages, and our API for custom integration and automated reporting." },
  { q: "What if I have a dispute or missing conversion?", a: "Contact our publisher support team. We’ll work with you and the advertiser to resolve tracking or payout issues." },
];

export default function PublishersContent() {
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
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium uppercase tracking-widest text-indigo-400">Monetize your traffic</motion.p>
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Earn more as a LinkHexa publisher</motion.h1>
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 max-w-xl text-base text-zinc-400 sm:text-lg">Join creators, bloggers, and influencers. Promote top brands, track every click, and get paid on time—no gatekeeping, no hassle.</motion.p>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap gap-4">
                  <Link href="/get-started" className="rounded-lg bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500">Join as publisher</Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Your dashboard</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div><p className="text-xl font-bold text-indigo-400">$1.2K</p><p className="text-xs text-zinc-500">This month</p></div>
                    <div><p className="text-xl font-bold text-white">4.2K</p><p className="text-xs text-zinc-500">Clicks</p></div>
                    <div><p className="text-xl font-bold text-white">128</p><p className="text-xs text-zinc-500">Conversions</p></div>
                    <div><p className="text-xl font-bold text-white">2.1%</p><p className="text-xs text-zinc-500">CR</p></div>
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">Next payout: Jan 28 · Join 10,000+ publishers worldwide</p>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  <Image src="/k.jpg" alt="Publishers and creators" width={600} height={400} className="aspect-[3/2] w-full object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
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

        {/* Join publishers + image */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="relative order-2 lg:order-1">
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                  <Image src="/kkhj.jpg" alt="Publisher dashboard and analytics" width={560} height={380} className="aspect-[4/3] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Share links. Earn commission.</h2>
                <p className="mt-4 text-zinc-400">One link. Multiple brands. Your audience, your earnings.</p>
                <p className="mt-4 text-zinc-400">Simple sign-up, instant access to offers, and transparent reporting. Start promoting in minutes. Whether you run a blog, a coupon site, or a social channel, we give you the tools and the offers to monetize your traffic without lock-in or hidden fees.</p>
                <ul className="mt-6 space-y-3">
                  {["Access 100+ trusted brands. Pick offers that fit your audience.", "Competitive commissions. Get paid for every sale you drive.", "Real-time tracking & weekly payouts. No guesswork, no delays."].map((item, i) => (
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

        {/* How it works for publishers */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Simple process</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>How it works for publishers</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">From sign-up to your first payout in four steps. No complex contracts—just sign up, pick offers, share links, and earn.</p>
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

        {/* Ways to earn */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Earn your way</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Ways to earn as a publisher</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Different advertisers run different commission models. Promote offers that pay per sale, per lead, per click, or a mix—whatever fits your audience.</p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {waysToEarn.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Top categories */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/3 h-[300px] w-[300px] rounded-full bg-violet-500/12 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(99,102,241,0.06),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Offer catalog</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Top categories to promote</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">From fashion to finance, find offers that match your niche. New programs are added regularly across verticals.</p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Publisher tools + image */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(99,102,241,0.1),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <Image src="/639b7845e9be869771e540b8_mural-blog-images.jpg" alt="Publisher success" width={560} height={400} className="aspect-[4/3] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Publisher tools</h2>
                <p className="mt-4 text-zinc-400">Everything you need to promote & track. Links, creatives, reporting, and support—all in one dashboard so you can focus on creating content and growing earnings.</p>
                <div className="mt-8 space-y-4">
                  {publisherTools.map((tool, i) => (
                    <div key={tool.title} className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                      <h3 className="font-semibold text-white">{tool.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Get paid on time */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(99,102,241,0.08),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Get paid on time</h2>
                <p className="mt-4 text-zinc-400">Payout options & schedule. We know timely payouts matter. LinkHexa runs weekly payout cycles so you don’t wait months to see your earnings.</p>
                <p className="mt-4 text-zinc-400">Once your balance meets the minimum and is approved, you choose how you get paid. Multiple payment methods are supported—including bank transfer, PayPal, and other options depending on your region. Payout thresholds are clear in your dashboard.</p>
                <ul className="mt-6 space-y-2">
                  {payoutPoints.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <Image src="/kkkk.jpg" alt="Payouts and support" width={560} height={380} className="aspect-[4/3] w-full object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative overflow-hidden py-12 sm:py-16">
          <div className="absolute inset-0 bg-zinc-900/50" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Publishers at a glance</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { val: "1.5k+", label: "Active publishers" },
                { val: "18,420+", label: "Live offers" },
                { val: "$84K+", label: "Commission paid (MTD)" },
                { val: "30 days", label: "Avg. payout cycle" },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center">
                  <p className="text-3xl font-bold text-indigo-400">{stat.val}</p>
                  <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who can join + Why publishers choose */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-violet-500/12 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Who can join?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Built for every type of publisher. Blog, coupon site, social, or YouTube—monetize your audience your way.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {whoCanJoin.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <p className="mx-auto mt-12 max-w-2xl text-center text-zinc-400">Why publishers choose LinkHexa. Simple sign-up, instant access to offers, and transparent reporting. Your audience, your content—we just connect you with brands that pay for results.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-center">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Track. Earn. Get paid. */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="absolute inset-0 bg-zinc-900/30" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Track. Earn. Get paid.</h2>
            <p className="mt-4 text-zinc-400">Real-time stats, weekly payouts, and a dashboard built for publishers. No black boxes—clear numbers and on-time payments.</p>
            <p className="mt-4 text-zinc-400">See exactly which links and offers perform. Filter by date, advertiser, or campaign so you can double down on what works. Our reporting is built for publishers who care about data, not just totals.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {["1.5k+ Active publishers", "30K+ Top brands", "Weekly Payouts"].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/60 px-6 py-3">
                  <p className="font-semibold text-indigo-400">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines & support + FAQ - one section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 top-1/3 h-[280px] w-[280px] rounded-full bg-violet-500/10 blur-[100px]" />
            <div className="absolute left-1/2 top-2/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Support</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Guidelines & support</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Promote with trust and get help when you need it.</p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
              <div className="grid border-b border-white/10 md:grid-cols-2 md:border-b-0 md:border-r">
                <div className="p-6 sm:p-8">
                  <h3 className="font-semibold text-white">Content guidelines</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">We want you to promote in a way that builds trust with your audience and with advertisers. Follow each program’s terms—typically no misleading claims, no incentivized traffic where prohibited, and clear disclosure when you use affiliate links. When in doubt, ask your account manager or check the offer description.</p>
                </div>
                <div className="border-t border-white/10 p-6 sm:p-8 md:border-t-0 md:border-r-0">
                  <h3 className="font-semibold text-white">Publisher support</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">Stuck on tracking, payouts, or which offer to pick? Our publisher support team is there to help. Get answers via email or in-dashboard chat, and access guides and FAQs. We also run webinars and send tips on best practices.</p>
                </div>
              </div>
            </div>
            <h2 className="mt-14 text-center text-xl font-bold tracking-tight text-white sm:text-2xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Frequently asked questions</h2>
            <div className="mt-8 space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40">
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

        {/* Logo carousel - same as homepage */}
        <HeroLogoCarousel />

        {/* CTA */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Ready to turn your traffic into earnings?</h2>
            <p className="mt-4 text-zinc-400">Become part of a powerful affiliate platform where advertisers, publishers, and creators work together to grow audiences, drive performance, and create new earning opportunities.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/get-started" className="rounded-lg bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500">Create publisher account</Link>
              <Link href="/contact" className="rounded-lg border-2 border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10">Contact publisher team</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
