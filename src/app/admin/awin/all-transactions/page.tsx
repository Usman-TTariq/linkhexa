import type { Metadata } from "next";
import AllTransactionsContent from "./AllTransactionsContent";

export const metadata: Metadata = {
  title: "All transactions (assign) | Admin | LinkHexa",
};

export default function Page() {
  return <AllTransactionsContent />;
}
