import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "LinkHexa | Performance Affiliate Marketing Network",
  description:
    "LinkHexa connects advertisers with high-quality affiliates to drive performance marketing results. Manage campaigns, track sales, and grow faster.",
  keywords: ["affiliate marketing", "performance marketing", "advertisers", "publishers", "LinkHexa"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "LinkHexa | Performance Affiliate Marketing Network",
    description: "LinkHexa connects advertisers with high-quality affiliates to drive performance marketing results. Manage campaigns, track sales, and grow faster.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
        suppressHydrationWarning
      >
        {/* Strip extension-injected attrs (password managers, form extensions) so hydration matches */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function stripExtensionAttrs() {
  try {
    var attrs = ['bis_skin_checked', 'fdprocessedid'];
    var strip = function() {
      attrs.forEach(function(attr) {
        document.querySelectorAll('[' + attr + ']').forEach(function(el) { el.removeAttribute(attr); });
      });
    };
    strip();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', strip);
    }
    document.addEventListener('DOMContentLoaded', function() {
      strip();
      var obs = new MutationObserver(function() { strip(); });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: attrs, subtree: true });
      setTimeout(function() { obs.disconnect(); }, 5000);
    });
  } catch (e) {}
})();
            `.trim(),
          }}
        />
        <div suppressHydrationWarning>
          {children}
        </div>
      </body>
    </html>
  );
}
