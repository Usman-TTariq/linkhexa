import type { Metadata } from "next";
import { Suspense } from "react";
import ThankYouContent from "./ThankYouContent";

export const metadata: Metadata = {
  title: "Thank You | LinkHexa",
  description: "Your signup has been received.",
};

export default function SignupThankYouPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500">Loading…</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
