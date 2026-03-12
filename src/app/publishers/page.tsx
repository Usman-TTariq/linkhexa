import type { Metadata } from "next";
import PublishersContent from "./PublishersContent";

export const metadata: Metadata = {
  title: "Join LinkHexa as a Publisher | Monetize Your Audience",
  description: "Become a LinkHexa publisher and promote leading brands across multiple industries. Earn commissions through performance-based affiliate marketing.",
};

export default function PublishersPage() {
  return <PublishersContent />;
}
