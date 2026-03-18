import Image from "next/image";
import Link from "next/link";

export default function ChooseAffiliateNetworkBody() {
  return (
    <div className="space-y-10">
      <section>
        <p className="text-zinc-300">
          Not all affiliate networks are the same. The right one can help you
          scale your income, get reliable tracking, and work with trusted
          brands. The wrong one can mean delayed payments, poor support, and
          lost conversions. With hundreds of options out there—from global
          giants to niche-focused platforms—knowing what to look for can save
          you time and money. Here&apos;s how to choose an affiliate network that
          fits your goals, your niche, and your stage of growth.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          What to Look for in an Affiliate Network
        </h2>
        <p className="mt-4 text-zinc-300">
          Before you sign up anywhere, run through this checklist. The best
          networks score well on all of these; the rest might leave you
          frustrated or underpaid.
        </p>
        <ul className="mt-6 list-disc space-y-3 pl-6 text-zinc-300">
          <li>
            <strong className="text-white">Transparent commission structures and payment terms</strong> — You should
            know exactly how much you earn per click, lead, or sale. Hidden
            fees, unclear deductions, or vague &quot;up to X%&quot; language are red flags.
            Look for networks that spell out commission types (CPA, CPS, CPL,
            rev share) and payment thresholds clearly.
          </li>
          <li>
            <strong className="text-white">Reliable tracking and reporting</strong> — Clicks, conversions, and
            revenue should show up in your dashboard without delay. If
            tracking is inconsistent or reports are hard to understand, you
            can&apos;t optimize. Real-time or near-real-time data is ideal.
          </li>
          <li>
            <strong className="text-white">Quality offers that match your niche</strong> — A network with
            thousands of offers is useless if none fit your audience. Check
            whether they have strong programs in your vertical (e.g. tech,
            finance, fashion, travel) and whether those advertisers are
            brands you&apos;d be proud to promote.
          </li>
          <li>
            <strong className="text-white">Support for beginners</strong> — Onboarding, help docs, and
            responsive support matter when you&apos;re new. Some networks are
            built for big publishers only; others welcome smaller ones with
            clear guides and a real support team.
          </li>
          <li>
            <strong className="text-white">Timely payouts and a clear payment schedule</strong> — Net-30 or
            net-45 is common, but the key is that payments actually arrive on
            time. Read reviews or ask in publisher communities about payment
            reliability before committing.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Understanding Commission Types
        </h2>
        <p className="mt-4 text-zinc-300">
          Networks and advertisers use different payout models. Knowing them
          helps you compare offers and pick a network that offers the type of
          commissions you want.
        </p>
        <dl className="mt-6 space-y-4 text-zinc-300">
          <div>
            <dt className="font-semibold text-white">CPA (Cost Per Action)</dt>
            <dd className="mt-1">
              You get paid when a user completes a specific action—sign-up,
              trial, form submit, or purchase. Most common for affiliates.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-white">CPS (Cost Per Sale)</dt>
            <dd className="mt-1">
              You earn a percentage or fixed amount per sale. Great for product
              reviews and comparison content where you drive direct purchases.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-white">CPL (Cost Per Lead)</dt>
            <dd className="mt-1">
              You get paid when someone submits a form or becomes a lead. Common
              in finance, insurance, and education.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-white">Rev share (Revenue Share)</dt>
            <dd className="mt-1">
              You earn a percentage of the customer&apos;s spending over time (e.g.
              subscriptions). Good for long-term passive income if the product
              has strong retention.
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-zinc-300">
          The best networks offer a mix of these so you can choose offers that
          fit your content and audience. LinkHexa supports multiple commission
          types and makes it easy to see which campaigns pay what.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Cookie Duration and Attribution
        </h2>
        <p className="mt-4 text-zinc-300">
          Cookie duration is how long a click is attributed to you. If someone
          clicks your link today and buys in 14 days, a 7-day cookie means you
          get nothing; a 30-day cookie means you get the commission. Longer
          cookies (30, 60, or 90 days) are generally better for publishers,
          especially for considered purchases like software or travel. When
          comparing networks, check the default and maximum cookie windows for
          the offers you care about.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Comparing Affiliate Networks
        </h2>
        <p className="mt-4 text-zinc-300">
          Once you know what you need, compare a shortlist of networks. Look at
          tracking technology (first-party vs third-party cookies, server-side
          tracking), cookie duration, commission types, and the verticals they
          specialize in. Some networks are strong in retail, others in
          finance or SaaS—pick one that has depth in your niche. LinkHexa
          focuses on performance marketing with clear reporting and
          publisher-friendly terms so you can focus on content while we handle
          the infrastructure.
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
          <Image
            src="/Affiliate-networks-600x300.png"
            alt="Affiliate networks comparison and selection"
            width={600}
            height={300}
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Red Flags to Avoid
        </h2>
        <p className="mt-4 text-zinc-300">
          Steer clear of networks or programs that show these warning signs:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-300">
          <li>Vague or constantly changing commission terms</li>
          <li>Frequent &quot;tracking issues&quot; or lost conversions with no resolution</li>
          <li>Delayed or missing payments without clear explanation</li>
          <li>No real support—only generic FAQs or no reply to emails</li>
          <li>Pressure to drive volume at the cost of quality (e.g. incentivized traffic that gets clawed back)</li>
          <li>Lack of transparency on which advertisers you&apos;re promoting or how payouts are calculated</li>
        </ul>
        <p className="mt-4 text-zinc-300">
          A good network wants you to succeed and will be upfront about rules,
          payouts, and best practices. If something feels off, ask in publisher
          forums or look for independent reviews before signing up.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Niche Fit Matters More Than Size
        </h2>
        <p className="mt-4 text-zinc-300">
          A network with 10,000 offers might sound impressive, but if only a
          handful fit your audience, you&apos;re better off with a smaller network
          that specializes in your space. For example, if you run a tech blog,
          look for networks with strong software, gadget, and SaaS programs. If
          you&apos;re in finance, prioritize networks known for insurance, credit
          cards, or investing offers. Quality and relevance beat quantity every
          time when it comes to conversion rates and reader trust.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          How Networks and Sub-Affiliate Structures Work
        </h2>
        <p className="mt-4 text-zinc-300">
          Some networks operate as direct partners to advertisers; others work
          through sub-affiliate or multi-tier structures. Understanding this
          helps you know where you sit in the chain and how commissions flow.
          In a well-run network, you get a single dashboard, one set of links,
          and clear reporting—whether the network is direct or has sub-partners.
          The important thing is that you see your clicks and conversions
          accurately and get paid on time.
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
          <Image
            src="/sub-affiliate-networks-image3.jpg"
            alt="Affiliate and sub-affiliate network structure"
            width={1200}
            height={630}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="mt-4 text-zinc-300">
          Whether you&apos;re a blogger, influencer, or coupon site, joining a
          network that aligns with your audience and pays on time makes a real
          difference. Start with one network, master their offers and tools,
          then expand as you grow. Many successful publishers use two or three
          networks to access different advertisers and compare performance.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Practical Tips for Choosing Your First (or Next) Network
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-zinc-300">
          <li>
            <strong className="text-white">Start with a shortlist of 2–3 networks</strong> that are known in your
            niche. Check their approved verticals and minimum traffic
            requirements so you don&apos;t waste time applying where you won&apos;t qualify.
          </li>
          <li>
            <strong className="text-white">Read the terms and payment policy</strong> before you apply. Look for
            payment threshold, frequency (weekly, bi-weekly, monthly), and
            method (PayPal, wire, etc.).
          </li>
          <li>
            <strong className="text-white">Apply with a clear picture of your traffic</strong> — site URL, monthly
            visitors, and content focus. Honest applications get approved
            faster and set the right expectations.
          </li>
          <li>
            <strong className="text-white">Test with a few offers first</strong> before going all-in. See how
            tracking holds up, how support responds, and whether payouts land
            on time. Then scale.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          FAQs
        </h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="font-semibold text-white">Can I join multiple affiliate networks?</dt>
            <dd className="mt-1 text-zinc-400">
              Yes. Many publishers use several networks to access different
              advertisers and compare payouts and support. Just keep your
              links and reporting organized.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-white">What if my traffic is low?</dt>
            <dd className="mt-1 text-zinc-400">
              Some networks have minimum traffic requirements; others welcome
              small publishers. Look for &quot;beginner-friendly&quot; or &quot;no minimum&quot;
              programs and grow from there.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-white">How do I know if a network is trustworthy?</dt>
            <dd className="mt-1 text-zinc-400">
              Check reviews, ask in publisher communities, and look for
              transparent terms and a real support team. LinkHexa is built on
              clear terms and timely payments so publishers can trust the
              relationship.
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Join a Network Built for Publishers
        </h2>
        <p className="mt-3 text-zinc-300">
          LinkHexa connects you with top offers, clear tracking, and timely
          payments. Transparent terms, real support, and reporting you can
          trust. See why publishers choose us.
        </p>
        <Link
          href="/publishers"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-600"
        >
          Join as Publisher
          <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}
