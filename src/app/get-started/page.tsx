import type { Metadata } from "next";
import GetStartedContent from "./GetStartedContent";

export const metadata: Metadata = {
  title: "Get Started | LinkHexa",
  description: "Choose your partnership path—sign up as an advertiser or publisher and grow with LinkHexa.",
};

export default function GetStartedPage() {
  return <GetStartedContent />;
}
