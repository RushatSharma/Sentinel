import {Navbar} from "../components/Navbar"; // <--- FIXED: No curly braces {}
import {HeroSection} from "../components/HeroSection";
import {FeaturesSection} from "../components/FeaturesSection";
import {ComplianceSection} from "../components/ComplianceSection";
import {ReportingSection} from "../components/ReportingSection";
import {CtaSection} from "../components/CtaSection";
import {Footer} from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ComplianceSection />
        <ReportingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}