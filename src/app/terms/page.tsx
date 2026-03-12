import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LinkHexa Terms and Conditions | Platform Terms of Use",
  description: "Review the LinkHexa Terms and Conditions outlining the rules, responsibilities, and guidelines for using our affiliate marketing platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="absolute -right-32 top-1/3 h-[280px] w-[280px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="relative">
            <Link
              href="/"
              className="mb-8 inline-block text-sm text-zinc-500 transition-colors hover:text-indigo-400"
            >
              ← Back to home
            </Link>
            <h1
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
            >
              Terms & Conditions
            </h1>
            <p className="mt-2 text-sm text-zinc-500">Last updated: March 2025</p>

            <div className="mt-12 space-y-10 text-zinc-400">
              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing or using the LinkHexa platform and services, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use our services.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">2. Description of Services</h2>
                <p className="leading-relaxed">
                  LinkHexa provides an affiliate and performance marketing platform that connects advertisers with publishers. We offer tools for campaign management, tracking, reporting, and payouts. We reserve the right to modify, suspend, or discontinue any part of the services with reasonable notice where practicable.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">3. Account and Eligibility</h2>
                <p className="leading-relaxed">
                  You must be at least 18 years old and have the authority to enter into these terms. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate and complete information when registering.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">4. Acceptable Use</h2>
                <p className="mb-4 leading-relaxed">
                  You agree not to use the platform to:
                </p>
                <ul className="list-inside list-disc space-y-2 pl-2">
                  <li>Violate any applicable law or third-party rights</li>
                  <li>Engage in fraud, misleading traffic, or invalid clicks</li>
                  <li>Distribute malware or harm our systems or users</li>
                  <li>Scrape or automate access without our permission</li>
                  <li>Resell or sublicense the services except as permitted</li>
                </ul>
                <p className="mt-4 leading-relaxed">
                  We may suspend or terminate accounts that breach these terms.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">5. Fees and Payments</h2>
                <p className="leading-relaxed">
                  Fees for advertisers and revenue share for publishers are as set out in your agreement or on the platform. You are responsible for any taxes applicable to your use of the services. We may change fees with reasonable notice. Payouts to publishers are subject to our payout schedule and verification requirements.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">6. Intellectual Property</h2>
                <p className="leading-relaxed">
                  LinkHexa and its content, branding, and technology are owned by us or our licensors. We grant you a limited, non-exclusive license to use the platform in accordance with these terms. You retain rights in your own content and data; you grant us a license to use them to provide and improve our services.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">7. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, LinkHexa shall not be liable for any indirect, incidental, special, or consequential damages, or for loss of profits or data, arising from your use of the services. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">8. Indemnification</h2>
                <p className="leading-relaxed">
                  You agree to indemnify and hold LinkHexa and its affiliates harmless from any claims, damages, or expenses (including legal fees) arising from your use of the services, your content, or your breach of these terms.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">9. Changes and Termination</h2>
                <p className="leading-relaxed">
                  We may update these terms from time to time; we will notify you of material changes. Continued use after changes constitutes acceptance. Either party may terminate the agreement in accordance with the platform terms. Upon termination, your right to use the services ceases.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">10. Contact</h2>
                <p className="leading-relaxed">
                  For questions about these Terms & Conditions, contact us at{" "}
                  <a href="mailto:legal@linkhexa.com" className="text-indigo-400 hover:underline">legal@linkhexa.com</a> or at the address in the footer.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
