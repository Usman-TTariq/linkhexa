import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AdminSupportContent from "./AdminSupportContent";

export const metadata: Metadata = {
  title: "Support Inbox | Admin | LinkHexa",
};

export default function Page() {
  return (
    <AdminShell>
      <AdminSupportContent />
    </AdminShell>
  );
}
