import type { Metadata } from "next";
import AdvertisersContent from "./AdvertisersContent";

export const metadata: Metadata = {
  title: "Advertisers | LinkHexa",
  description: "Grow with the right partnership. Connect with quality publishers, pay for performance, and track every sale in real time.",
};

export default function AdvertisersPage() {
  return <AdvertisersContent />;
}
