import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinPlaceholderContent from "@/components/admin/AwinPlaceholderContent";

export const metadata: Metadata = {
  title: "Awin Reports | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinPlaceholderContent
        title="Awin — Reports"
        body="For transaction and sale rows from Awin, open Sales / transactions in the menu. This section can host extra charts or advertiser performance later."
      />
    </AdminShell>
  );
}
