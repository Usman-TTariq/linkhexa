import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us | LinkHexa",
  description: "Get in touch with LinkHexa. Reach out for partnerships, support, or general inquiries.",
};

export default function ContactPage() {
  return <ContactContent />;
}
