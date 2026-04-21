import type { Metadata } from "next";
import AdvertiserPerformanceReportContent from "@/components/publisher/AdvertiserPerformanceReportContent";

export const metadata: Metadata = {
  title: "Advertiser performance | LinkHexa",
  description: "Publisher report: clicks and links by advertiser (brand).",
};

export default function AdvertiserPerformanceReportPage() {
  return <AdvertiserPerformanceReportContent />;
}
