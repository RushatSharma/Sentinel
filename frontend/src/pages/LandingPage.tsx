import { Navbar } from "@/components/Navbar";
import { LandingHero } from "@/components/LandingHero"; // IMPORT NEW HERO
import { FeaturesSection } from "@/components/FeaturesSection";
import { ComplianceSection } from "@/components/ComplianceSection";
import { ReportingSection } from "@/components/ReportingSection";
import { Footer } from "@/components/Footer";
import { ComplianceTicker } from "@/components/ComplianceTicker"; 

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow">
        {/* REPLACED HeroSection WITH LandingHero */}
        <LandingHero />
        
        
        <FeaturesSection />
        <ComplianceSection />
        <ReportingSection />
        <ComplianceTicker />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;