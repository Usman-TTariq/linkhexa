import type { Metadata } from "next";
import AdvertisersContent from "./AdvertisersContent";

export const metadata: Metadata = {
  title: "LinkHexa for Advertisers | Launch Your Affiliate Program",
  description: "Grow your brand with LinkHexa. Our affiliate network connects advertisers with high-quality publishers to drive sales, leads, and measurable performance.",
};

export default function AdvertisersPage() {
  return <AdvertisersContent />;
}
