import type { Metadata } from "next";
import PublishersContent from "./PublishersContent";

export const metadata: Metadata = {
  title: "Publishers | LinkHexa",
  description: "Monetize your traffic. Join creators, bloggers, and influencers. Promote top brands, track every click, and get paid on time.",
};

export default function PublishersPage() {
  return <PublishersContent />;
}
