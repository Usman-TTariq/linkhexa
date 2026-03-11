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
  title: "LinkHexa | Modern SaaS Platform",
  description:
    "The all-in-one platform to grow your business. Automate, integrate, and scale with ease.",
  keywords: ["SaaS", "automation", "integrations", "business"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "LinkHexa | Modern SaaS Platform",
    description: "The all-in-one platform to grow your business.",
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
        {/* Strip extension-injected attrs (e.g. bis_skin_checked from password managers) so hydration matches */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function stripExtensionAttrs() {
  try {
    var strip = function() {
      document.querySelectorAll('[bis_skin_checked]').forEach(function(el) { el.removeAttribute('bis_skin_checked'); });
    };
    strip();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', strip);
    }
    document.addEventListener('DOMContentLoaded', function() {
      strip();
      var obs = new MutationObserver(function() { strip(); });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['bis_skin_checked'], subtree: true });
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
