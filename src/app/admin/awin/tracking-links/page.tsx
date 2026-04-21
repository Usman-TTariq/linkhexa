import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinTrackingLinksContent from "./AwinTrackingLinksContent";

export const metadata: Metadata = {
  title: "Awin Tracking links | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinTrackingLinksContent />
    </AdminShell>
  );
}
