import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { MissionSection } from "@/components/landing/MissionSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { BenefitsGrid } from "@/components/landing/BenefitsGrid";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { BottomCTA } from "@/components/landing/BottomCTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <FeatureGrid />
      <BenefitsGrid />
      <VideoShowcase />
      <Testimonials />
      <BottomCTA />
      <Footer />
    </main>
  );
};

export default Index;
