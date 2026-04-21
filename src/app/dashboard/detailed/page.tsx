import type { Metadata } from "next";
import PublisherDashboardDetailedContent from "@/components/publisher/PublisherDashboardDetailedContent";

export const metadata: Metadata = {
  title: "Detailed dashboard | LinkHexa",
  description: "Full publisher earnings, tracking links, Awin transactions, and diagnostics.",
};

export default function PublisherDetailedDashboardPage() {
  return <PublisherDashboardDetailedContent />;
}
