import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroLogoCarousel from "@/components/HeroLogoCarousel";
import Features from "@/components/Features";
import ForAdvertisers from "@/components/ForAdvertisers";
import ForPublishers from "@/components/ForPublishers";
import ImpactByNumbers from "@/components/ImpactByNumbers";
import HowItWorks from "@/components/HowItWorks";
import Integrations from "@/components/Integrations";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import TrustAndPartnerships from "@/components/TrustAndPartnerships";
import BlogPreview from "@/components/BlogPreview";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HeroLogoCarousel />
        <Features />
        <ForAdvertisers />
        <HowItWorks />
        <ForPublishers />
        <ImpactByNumbers />
        <Integrations />
        <Testimonials />
        <FAQ />
        <TrustAndPartnerships />
        <BlogPreview />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
