import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ComplianceSection } from "@/components/ComplianceSection";
import { ReportingSection } from "@/components/ReportingSection"; // Import the new section
import { Footer } from "@/components/Footer";
import { InteractiveTerminal } from "@/components/InteractiveTerminal";
import { BentoGrid } from "@/components/BentoGrid";
import { ComplianceTicker } from "@/components/ComplianceTicker";


const LandingPage = () => {
  return (
    // Added 'grid-background' to apply the texture globally
    <div className="min-h-screen bg-background grid-background">
      <Navbar />
      <main>
         <HeroSection />
        <BentoGrid />
        <InteractiveTerminal />
        <ComplianceSection />
        <ReportingSection />
        <ComplianceTicker />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;