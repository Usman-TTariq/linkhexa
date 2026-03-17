import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LinkHexa Mediakit | Brand Assets & Press",
  description: "Download the LinkHexa mediakit for logos, brand guidelines, and press assets.",
};

export default function MediakitPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute -left-32 top-1/4 h-[280px] w-[280px] rounded-full bg-indigo-500/15 blur-[100px]" />
          <div className="pointer-events-none absolute -right-32 top-1/3 h-[280px] w-[280px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="relative">
            <Link
              href="/"
              className="mb-6 inline-block text-sm text-zinc-500 transition-colors hover:text-indigo-400"
            >
              ← Back to home
            </Link>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                  style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
                >
                  Mediakit
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Brand assets, logos, and press information for LinkHexa.
                </p>
              </div>
              <a
                href="/LinkHexa-mediakit.pdf"
                download="LinkHexa-mediakit.pdf"
                className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Download PDF
              </a>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50">
              <iframe
                src="/LinkHexa-mediakit.pdf"
                title="LinkHexa Mediakit PDF"
                className="h-[calc(100vh-14rem)] min-h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
