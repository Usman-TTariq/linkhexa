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
    icon: "/LinkHexa Favicon Svg.svg",
    shortcut: "/LinkHexa Favicon Svg.svg",
    apple: "/LinkHexa favicon Png.png",
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
        {/* Strip extension-injected attrs (e.g. bis_skin_checked) before hydration to reduce mismatch warnings */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.querySelectorAll('[bis_skin_checked]').forEach(function(e){e.removeAttribute('bis_skin_checked');});}catch(e){}})();`,
          }}
        />
        <div suppressHydrationWarning>
          {children}
        </div>
      </body>
    </html>
  );
}
