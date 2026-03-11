import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us | LinkHexa",
  description: "We connect brands with the right publishers and make payouts simple. Learn about LinkHexa.",
};

export default function AboutPage() {
  return <AboutContent />;
}
