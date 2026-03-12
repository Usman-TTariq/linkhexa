import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LinkHexa Imprint | Company Information & Legal Details",
  description: "View the LinkHexa Imprint page for official company information, contact details, and legal disclosures related to our affiliate network.",
};

const cardClass = "rounded-xl border border-white/10 bg-zinc-900/80 p-6";

const socials = [
  { name: "Facebook", href: "#", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { name: "X", href: "#", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "Instagram", href: "#", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { name: "LinkedIn", href: "#", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];

export default function ImprintPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="absolute -left-32 top-1/4 h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute -right-32 top-1/3 h-[280px] w-[280px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="relative">
            <Link
              href="/"
              className="mb-8 inline-block text-sm text-zinc-500 transition-colors hover:text-indigo-400"
            >
              ← Back to home
            </Link>
            <div className="text-center">
              <h1
                className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
                style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
              >
                Legal Information
              </h1>
              <p className="mt-2 text-zinc-500">
                Company information and legal details for LinkHexa
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-6">
                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Imprint</h2>
                  <div className="space-y-1 text-sm text-zinc-400">
                    <p className="font-semibold text-white">LINKHEXA LLC</p>
                    <p>Office of the Secretary of State, Illinois</p>
                    <p>Phone: +1 510 863 1830</p>
                    <p>811 Wilshire Blvd Ste 1753</p>
                    <p>Los Angeles, CA 90017</p>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Contact</h2>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <p>
                      Partners:{" "}
                      <a href="mailto:partner@linkhexa.com" className="text-indigo-400 hover:underline">
                        partner@linkhexa.com
                      </a>
                    </p>
                    <p>
                      Support:{" "}
                      <a href="mailto:support@linkhexa.com" className="text-indigo-400 hover:underline">
                        support@linkhexa.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Legal</h2>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <p>
                      <a href="mailto:legal@linkhexa.com" className="text-indigo-400 hover:underline">
                        legal@linkhexa.com
                      </a>
                    </p>
                    <p className="text-zinc-500">Please contact our team only for legal purposes.</p>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Socials</h2>
                  <div className="flex gap-3">
                    {socials.map((s) => (
                      <a
                        key={s.name}
                        href={s.href}
                        aria-label={s.name}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-indigo-500/50 hover:text-white"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon}/></svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Responsible for Content & Technology</h2>
                  <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
                    <p>
                      LinkHexa is committed to providing accurate and transparent information. All content on this platform is maintained by our dedicated team to ensure quality, compliance, and reliability in affiliate marketing operations. We strive to ensure that all information, tools, and services provided are accurate, functional, and up to date. However, despite careful content management, we cannot guarantee absolute completeness or real-time accuracy of the information displayed.
                    </p>
                    <p className="font-medium text-white">Company: LINKHEXA LLC</p>
                    <p>Address: 811 Wilshire Blvd Ste 1753, Los Angeles, CA 90017</p>
                    <p>Phone: +1 510 863 1830</p>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Data Protection</h2>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    LinkHexa takes data protection seriously and implements strict security measures to safeguard user information against unauthorized access, misuse, or disclosure. Data collected through our platform is processed only for legitimate business purposes, such as affiliate tracking, reporting, and service improvements. We do not share personal data with third parties without legal basis or user consent. For detailed information on how we collect, use, and protect your data, please refer to our{" "}
                    <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
                  </p>
                </div>

                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Liability for Content</h2>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    The content published on LinkHexa is created with the utmost care and is regularly reviewed. However, we do not assume liability for any inaccuracies, omissions, or outdated information. External contributors or advertisers may provide some content, and we do not verify or endorse third-party claims. If you believe any content violates legal provisions or industry standards, please notify us at{" "}
                    <a href="mailto:legal@linkhexa.com" className="text-indigo-400 hover:underline">legal@linkhexa.com</a>.
                  </p>
                </div>

                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Liability for Links</h2>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Our platform contains links to external websites for informational purposes. We have no control over the content, privacy practices, or availability of these third-party sites and cannot accept responsibility for their accuracy or legality. The inclusion of any external link does not imply endorsement by LinkHexa. If you find any problematic or inappropriate links, please report them to{" "}
                    <a href="mailto:legal@linkhexa.com" className="text-indigo-400 hover:underline">legal@linkhexa.com</a>.
                  </p>
                </div>

                <div className={cardClass}>
                  <h2 className="mb-4 text-lg font-semibold text-white">Copyright</h2>
                  <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
                    <p>
                      All content on the LinkHexa platform, including text, graphics, logos, and software, is the property of LINKHEXA LLC or its content suppliers and is protected by international copyright laws. Unauthorized use, reproduction, or distribution of any content from this platform is strictly prohibited without prior written consent from LinkHexa.
                    </p>
                    <p>© {new Date().getFullYear()} LINKHEXA LLC. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
