import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ComplianceSection } from "@/components/ComplianceSection";
import { ReportingSection } from "@/components/ReportingSection";
import { CtaSection } from "@/components/CtaSection"; // Import the new section
import { Footer } from "@/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ComplianceSection />
        <ReportingSection />
        <CtaSection /> {/* Add it right here */}
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;