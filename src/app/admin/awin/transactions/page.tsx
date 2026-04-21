import type { Metadata } from "next";
import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AwinTransactionsContent from "./AwinTransactionsContent";

export const metadata: Metadata = {
  title: "Awin Sales & Transactions | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <AwinTransactionsContent />
      </Suspense>
    </AdminShell>
  );
}
