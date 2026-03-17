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
  { num: "01", title: "Join for Free", desc: "Create your publisher account in minutes. Provide basic details about your website or channel, and most applications are approved within 24–48 hours." },
  { num: "02", title: "Discover & Join Offers", desc: "Browse thousands of offers by category, commission type, and brand. Apply to programs that match your audience and get approved by advertisers." },
  { num: "03", title: "Promote Links & Creative Assets", desc: "Access tracking links, banners, and promo codes directly from your dashboard. Use our deep link generator or API for custom integrations when needed." },
  { num: "04", title: "Track Performance & Receive Payments", desc: "See clicks and conversions in real time. Once you hit the payout threshold, receive weekly payments via bank transfer, PayPal, or other convenient methods." },
];

const waysToEarn = [
  { title: "Commission per Sale (CPS)", desc: "Earn a fixed amount or a percentage each time a purchase is made through your link. Perfect for product reviews, deal sites, and e-commerce content." },
  { title: "Cost per Lead (CPL)", desc: "Get compensated for every qualified lead—such as sign-ups, quote requests, or form submissions. Ideal for finance, insurance, and B2B-focused content." },
  { title: "Cost per Action (CPA)", desc: "Receive earnings when users complete a specific action, like trial registrations, app installs, or subscriptions. Suited for SaaS platforms, apps, and subscription services." },
  { title: "Revenue Share", desc: "Earn ongoing commissions from recurring revenue. Best for promoting subscription-based or membership products for long-term income." },
  { title: "Coupons & Promo Codes", desc: "Distribute exclusive codes and earn whenever your audience redeems them at checkout. Popular among deal and coupon publishers." },
  { title: "Hybrid & Bonus Programs", desc: "Many campaigns combine multiple models or offer bonus tiers when targets are met. Higher performance often leads to better rates and rewards." },
];

const categories = [
  { title: "E-commerce & Retail", desc: "Promote fashion, electronics, and home products—earn commissions on every sale." },
  { title: "Finance & Insurance", desc: "High-value CPL offers for loans, insurance plans, and credit services." },
  { title: "Travel & Hospitality", desc: "Earn per booking on hotels, flights, and travel packages." },
  { title: "Health & Wellness", desc: "Promote supplements, fitness programs, and wellness products with recurring revenue opportunities." },
  { title: "Software & SaaS", desc: "Drive trial sign-ups and subscriptions through CPA or revenue share models." },
  { title: "Education & Online Learning", desc: "Earn from online courses, certifications, and educational platforms." },
  { title: "Telecom & Utilities", desc: "Promote broadband, mobile, and energy services with performance-based payouts." },
  { title: "Gaming & Apps", desc: "Monetize app installs and in-game offers using CPI and CPA campaigns." },
];

const publisherTools = [
  { title: "Tracking Links", desc: "Create unique links for each offer or campaign. Use deep links to direct users to specific app screens or category pages." },
  { title: "Banners & Creative Assets", desc: "Access ready-to-use banners, text links, product feeds, and coupon or promo code lists to enhance your promotions." },
  { title: "Reports & Analytics", desc: "Monitor clicks, conversions, and earnings in real time. Export detailed data by date, offer, or traffic source." },
  { title: "API & Deep Linking", desc: "Seamlessly integrate with your website or app. Generate custom links and automate reporting through our API." },
];

const payoutPoints = [
  "Weekly payout cycles",
  "Low minimum payout threshold",
  "Multiple payment methods: bank transfer, PayPal, and more",
  "Transparent breakdown of pending vs. approved earnings",
];

const whoCanJoin = [
  { title: "Content & Bloggers", desc: "Publish reviews, guides, and articles. Convert your site traffic into affiliate revenue with easy-to-use links." },
  { title: "Coupons & Deal Sites", desc: "Promote discounts and promo codes, earning commissions whenever your audience clicks and completes a purchase." },
  { title: "Social & Influencers", desc: "Monetize your social following. Creators earn commissions on every sale generated through their content." },
];

const perks = [
  { title: "Fast Approval", desc: "Join and get approved quickly—start promoting offers within 24–48 hours." },
  { title: "Live Performance Tracking", desc: "Monitor clicks, conversions, and earnings in real time with no delays." },
  { title: "Flexible Payouts", desc: "Receive weekly payments with no complicated minimums or hurdles." },
  { title: "Dedicated Publisher Support", desc: "Get assistance from real support specialists who understand publisher needs." },
];

const faqs = [
  { q: "1. Who can join LinkHexa as a publisher?", a: "Any content creator, blogger, coupon site owner, influencer, or social media channel can join. Our network supports all types of publishers looking to monetize their audience." },
  { q: "2. How do I start earning commissions?", a: "Sign up, get approved, choose offers that fit your audience, share your unique tracking links, and earn whenever users complete actions like sales, leads, or installs." },
  { q: "3. What types of commission models are available?", a: "LinkHexa supports CPS (per sale), CPL (per lead), CPA (per action), revenue share, coupon/promo-based commissions, and hybrid programs—so you can pick what works best for your content and audience." },
  { q: "4. How do I track performance and earnings?", a: "Our dashboard provides real-time tracking of clicks, conversions, and revenue. You can filter by date, advertiser, or campaign to optimize your strategy with actionable insights." },
  { q: "5. When and how do I get paid?", a: "Publishers receive weekly payouts once the balance reaches the minimum threshold. Payments can be made via bank transfer, PayPal, or other supported methods depending on your region." },
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
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium uppercase tracking-widest text-indigo-400">Monetize Your Audience</motion.p>
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Maximize Earnings as a LinkHexa Publisher</motion.h1>
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 max-w-xl text-base text-zinc-400 sm:text-lg">Join a network of creators, bloggers, and influencers. Promote leading brands, monitor every click, and receive timely payments—simple, transparent, and hassle-free.</motion.p>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap gap-4">
                  <Link href="/get-started" className="rounded-lg bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500">Join as a publisher</Link>
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
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Promote Links, Earn Commissions</h2>
                <p className="mt-4 text-zinc-400">One link gives you access to multiple brands—your audience, your revenue.</p>
                <p className="mt-4 text-zinc-400">Sign up quickly, get instant access to top offers, and enjoy transparent reporting. Start promoting in minutes. Whether you manage a blog, coupon site, or social channel, we provide the tools and offers to monetize your traffic—no lock-ins, no hidden fees.</p>
                <ul className="mt-6 space-y-3">
                  {["Access 100+ trusted brands and choose offers that match your audience", "Competitive commissions—earn on every sale you drive", "Real-time tracking and weekly payouts for total transparency and reliability"].map((item, i) => (
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
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Easy & Straightforward</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>How Publishers Get Started</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Go from sign-up to your first payout in four simple steps. No complicated contracts—just register, choose offers, share links, and start earning.</p>
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
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Monetize Your Traffic</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Flexible Ways to Earn</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Advertisers offer a variety of commission models. Promote campaigns that pay per sale, per lead, per click, or a combination—choose what works best for your audience.</p>
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
            <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-400">Offer Marketplace</p>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Popular Categories to Promote</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Discover offers across a wide range of industries—from fashion to finance—tailored to your audience. New campaigns are added regularly to keep your options fresh.</p>
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
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Publisher Tools</h2>
                <p className="mt-4 text-zinc-400">All-in-One Platform for Promotion & Tracking. Access links, creative assets, performance reports, and dedicated support—all from a single dashboard. Focus on creating content and maximizing your earnings while we handle the tracking and management.</p>
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
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Payout Options & Schedule</h2>
                <p className="mt-4 text-zinc-400">We understand the importance of getting paid on time. LinkHexa processes weekly payouts so you don’t have to wait months to receive your earnings.</p>
                <p className="mt-4 text-zinc-400">Once your balance reaches the minimum and is approved, you can select your preferred payment method. We support multiple options—including bank transfer, PayPal, and region-specific methods. Your dashboard clearly shows pending and approved balances.</p>
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
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Who Can Join?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">Designed for all types of publishers—whether you run a blog, coupon site, social channel, or YouTube, you can monetize your audience your way.</p>
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
            <p className="mx-auto mt-12 max-w-2xl text-center text-zinc-400">Fast approval, live tracking, flexible payouts, and dedicated support—everything publishers need to grow.</p>
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
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Monitor. Monetize. Receive Payments.</h2>
            <p className="mt-4 text-zinc-400">Access real-time analytics, weekly payouts, and a dashboard designed specifically for publishers. No hidden metrics—just transparent numbers and timely payments.</p>
            <p className="mt-4 text-zinc-400">See exactly which links and offers are driving results. Filter by date, advertiser, or campaign to focus on what works best. Our reporting is built for publishers who value actionable insights, not just summary totals.</p>
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
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Frequently Asked Questions</h2>
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
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>Start Monetizing Your Audience Today</h2>
            <p className="mt-4 text-zinc-400">Join a dynamic affiliate platform where advertisers, publishers, and creators collaborate to expand reach, boost results, and unlock new revenue opportunities.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/get-started" className="rounded-lg bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500">Create Publisher Account</Link>
              <Link href="/contact" className="rounded-lg border-2 border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10">Contact Publisher Team</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
