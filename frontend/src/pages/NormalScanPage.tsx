import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection"; // FIXED: Changed from Hero to HeroSection

const NormalScanPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      {/* The main container ensures the Hero takes up appropriate space below nav */}
      <main className="flex-grow relative">
         {/* We reuse the existing HeroSection component which contains the scan input */}
         <HeroSection />
      </main>
    </div>
  );
};

export default NormalScanPage;