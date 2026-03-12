import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LinkHexa Privacy Policy | Data Protection & User Privacy",
  description: "Read the LinkHexa Privacy Policy to learn how we collect, use, and protect your personal information while using our affiliate marketing network.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="absolute -left-32 top-1/4 h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[100px]" />
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
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-zinc-500">Last updated: March 2025</p>

            <div className="mt-12 space-y-10 text-zinc-400">
              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">1. Introduction</h2>
                <p className="leading-relaxed">
                  LinkHexa (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the LinkHexa platform and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our affiliate marketing platform, including our website and services.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">2. Information We Collect</h2>
                <p className="mb-4 leading-relaxed">
                  We may collect information that you provide directly, including:
                </p>
                <ul className="list-inside list-disc space-y-2 pl-2">
                  <li>Account information (name, email, company, payment details)</li>
                  <li>Usage data (how you use the platform, campaigns, and reports)</li>
                  <li>Communications (support requests, feedback)</li>
                  <li>Device and log data (IP address, browser type, access times)</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">3. How We Use Your Information</h2>
                <p className="leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services; to process transactions; to send you updates and support; to comply with legal obligations; and to protect the security of our platform and users.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">4. Sharing and Disclosure</h2>
                <p className="leading-relaxed">
                  We do not sell your personal information. We may share information with service providers who assist our operations, with partners necessary to deliver the affiliate and performance marketing services you use, or when required by law or to protect our rights.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">5. Data Security</h2>
                <p className="leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">6. Your Rights</h2>
                <p className="leading-relaxed">
                  Depending on your location, you may have rights to access, correct, delete, or port your data, or to object to or restrict certain processing. Contact us at{" "}
                  <a href="mailto:legal@linkhexa.com" className="text-indigo-400 hover:underline">legal@linkhexa.com</a> to exercise these rights.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">7. Cookies and Tracking</h2>
                <p className="leading-relaxed">
                  We use cookies and similar technologies to operate our website, remember your preferences, and analyze usage. You can manage cookie preferences in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">8. Contact Us</h2>
                <p className="leading-relaxed">
                  For questions about this Privacy Policy or our practices, contact us at{" "}
                  <a href="mailto:legal@linkhexa.com" className="text-indigo-400 hover:underline">legal@linkhexa.com</a> or at the address listed in the footer.
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
