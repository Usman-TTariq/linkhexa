import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: "LinkHexa Blog | Affiliate Marketing Insights, Tips & News",
  description:
    "Explore the LinkHexa blog for the latest affiliate marketing insights, industry news, and performance marketing strategies for advertisers and publishers.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main>
        <BlogList />
      </main>
      <Footer />
    </>
  );
}
