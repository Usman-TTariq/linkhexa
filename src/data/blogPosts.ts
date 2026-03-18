export interface StaticPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  mainImage: string;
  mainImageAlt: string;
  category?: string;
  readTimeMinutes?: number;
  author?: string;
  bodyKey: string;
}

const STATIC_POSTS: StaticPost[] = [
  {
    slug: "affiliate-marketing-beginners-guide-2026",
    title: "Affiliate Marketing in 2026: A Beginner's Guide to Earning Online",
    excerpt:
      "Learn how affiliate marketing works and how to start earning online with LinkHexa. A simple guide for creators, bloggers, and businesses.",
    publishedAt: "2026-03-12",
    mainImage: "/affiliatemarketingwebsites.jpg",
    mainImageAlt: "Affiliate marketing concept on laptop in modern office",
    category: "Guide",
    readTimeMinutes: 14,
    author: "LinkHexa Team",
    bodyKey: "affiliate-guide-2026",
  },
  {
    slug: "how-to-choose-right-affiliate-network",
    title: "How to Choose the Right Affiliate Network for Your Niche",
    excerpt:
      "Compare tracking, payouts, and support. Learn what to look for in an affiliate network and why publishers choose LinkHexa.",
    publishedAt: "2026-03-11",
    mainImage: "/Affiliate-networks-600x300.png",
    mainImageAlt: "Affiliate networks comparison and selection",
    category: "Guide",
    readTimeMinutes: 14,
    author: "LinkHexa Team",
    bodyKey: "choose-affiliate-network",
  },
  {
    slug: "publisher-success-turn-audience-into-revenue",
    title: "Publisher Success: Turn Your Audience into Revenue",
    excerpt:
      "Build trust, pick the right offers, and scale your affiliate income. A practical guide for bloggers and content creators.",
    publishedAt: "2026-03-10",
    mainImage: "/639b7845e9be869771e540b8_mural-blog-images.jpg",
    mainImageAlt: "Publisher and content creator success",
    category: "Tips",
    readTimeMinutes: 13,
    author: "LinkHexa Team",
    bodyKey: "publisher-success",
  },
  {
    slug: "performance-marketing-for-advertisers-2026",
    title: "Performance Marketing for Advertisers in 2026",
    excerpt:
      "Pay for results, not impressions. How advertisers use affiliate and performance networks to scale with full visibility.",
    publishedAt: "2026-03-09",
    mainImage: "/monetize-advertise-results.png",
    mainImageAlt: "Monetize, advertise, and measure results",
    category: "Advertisers",
    readTimeMinutes: 13,
    author: "LinkHexa Team",
    bodyKey: "performance-marketing-advertisers",
  },
  {
    slug: "content-creators-guide-to-affiliate-income",
    title: "Content Creators' Guide to Affiliate Income",
    excerpt:
      "Monetize your YouTube, blog, or social following with affiliate links. One link, many platforms—start small and scale.",
    publishedAt: "2026-03-08",
    mainImage: "/young-business-people-meeting-office-teamwork-group-success-corporate-discussion_565246-1628.avif",
    mainImageAlt: "Content creators and team collaboration",
    category: "Guide",
    readTimeMinutes: 13,
    author: "LinkHexa Team",
    bodyKey: "content-creators-affiliate-income",
  },
  {
    slug: "why-linkhexa-for-publishers-and-advertisers",
    title: "Why LinkHexa for Publishers and Advertisers",
    excerpt:
      "Simple tracking, on-time payments, no lock-ins. See why publishers and advertisers choose LinkHexa for performance marketing.",
    publishedAt: "2026-03-07",
    mainImage: "/thumbnail-affiliate-networks-04.jpg",
    mainImageAlt: "Affiliate networks and partnerships",
    category: "Company",
    readTimeMinutes: 12,
    author: "LinkHexa Team",
    bodyKey: "why-linkhexa",
  },
];

export function getStaticPostBySlug(slug: string): StaticPost | null {
  return STATIC_POSTS.find((p) => p.slug === slug) ?? null;
}

export function getAllStaticPosts(): StaticPost[] {
  return [...STATIC_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/** Shape compatible with list cards (Sanity Post-like) */
export function getAllStaticPostsForList(): Array<{
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  mainImage?: { asset: { url: string }; alt?: string };
}> {
  return getAllStaticPosts().map((p) => ({
    _id: `static-${p.slug}`,
    title: p.title,
    slug: { current: p.slug },
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    mainImage: { asset: { url: p.mainImage }, alt: p.mainImageAlt },
  }));
}
