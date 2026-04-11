import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AwinTransactionsContent from "./AwinTransactionsContent";

export const metadata: Metadata = {
  title: "Awin Sales & Transactions | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AwinTransactionsContent />
    </AdminShell>
  );
}
