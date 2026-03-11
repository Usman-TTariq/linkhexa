"use client";

import Image from "next/image";

const brandLogos = [
  { src: "/aliexpress.png", alt: "AliExpress" },
  { src: "/asiaone-pr.png", alt: "AsiaOne" },
  { src: "/bloomberg-pr.png", alt: "Bloomberg" },
  { src: "/bloomchic.png", alt: "BLOOMCHIC" },
  { src: "/businessinsider-pr.png", alt: "Business Insider" },
  { src: "/carters.png", alt: "Carter's" },
  { src: "/digitaljournal-pr.png", alt: "Digital Journal" },
];

export default function HeroLogoCarousel() {
  return (
    <section className="border-b border-white/10 bg-zinc-800/60 py-6 sm:py-8">
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee gap-8 sm:gap-12">
          {[...brandLogos, ...brandLogos].map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              className="flex h-8 w-[120px] shrink-0 items-center justify-center sm:h-10 sm:w-[140px]"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={40}
                className="h-full w-full object-contain object-center opacity-80 transition-opacity hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
