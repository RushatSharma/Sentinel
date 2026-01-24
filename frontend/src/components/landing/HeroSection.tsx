import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  // CONFIGURATION: Pure Green Theme
  // Primary Green: #14FF14 (RGB: 20, 255, 20)
  
  // 1. Central Glow Orb (Pulses transparency)
  const glowCycle = [
    "rgba(20, 255, 20, 0.4)", 
    "rgba(20, 255, 20, 0.6)", // Brighter pulse
    "rgba(20, 255, 20, 0.4)"
  ];

  // 2. Glow Shadow (Pulses size/intensity)
  const glowShadowCycle = [
    "0 0 100px 50px rgba(20, 255, 20, 0.4)", 
    "0 0 120px 60px rgba(20, 255, 20, 0.6)", 
    "0 0 100px 50px rgba(20, 255, 20, 0.4)"
  ];

  // 3. Ring Border Colors
  const borderCycle = [
    "rgba(20, 255, 20, 0.4)", 
    "rgba(20, 255, 20, 0.4)", 
    "rgba(20, 255, 20, 0.4)"
  ];

  // 4. Satellite Dot (Always solid Green)
  const dotColorCycle = ["#14FF14", "#14FF14", "#14FF14"];
  const dotShadowCycle = [
    "0 0 20px 5px rgba(20, 255, 20, 0.6)", 
    "0 0 30px 10px rgba(20, 255, 20, 0.6)", 
    "0 0 20px 5px rgba(20, 255, 20, 0.6)"
  ];

  const transitionSettings = {
    duration: 4, 
    repeat: Infinity,
    ease: "easeInOut"
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      
      {/* Background Effects Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        
        {/* Ring Position Wrapper */}
        <div className="relative flex items-center justify-center translate-y-6">
          
          {/* Central Glow Orb */}
          <motion.div 
            animate={{ 
              backgroundColor: glowCycle,
              boxShadow: glowShadowCycle 
            }}
            transition={transitionSettings}
            className="absolute w-[300px] h-[300px] md:w-[350px] md:h-[350px] rounded-full blur-[80px]" 
          />
          
          {/* Revolving Orbital Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute w-[600px] h-[600px] md:w-[500px] md:h-[500px] opacity-100" 
          >
            {/* Ring Border */}
            <motion.div 
              animate={{ borderColor: borderCycle }}
              transition={transitionSettings}
              className="w-full h-full rounded-full border-[3px]" 
            />
            
            {/* Satellite Dot */}
            <motion.div 
              animate={{ 
                backgroundColor: dotColorCycle,
                boxShadow: dotShadowCycle
              }}
              transition={transitionSettings}
              className="absolute top-1/2 right-0 w-5 h-5 rounded-full transform -translate-y-1/2 translate-x-1/2" 
            />
          </motion.div>

        </div>

        {/* Background Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 0.6, 
              stroke: dotColorCycle
            }}
            transition={{
              pathLength: { duration: 2, delay: 0.5 },
              opacity: { duration: 2, delay: 0.5 },
              stroke: transitionSettings
            }}
            d="M-100 600 Q 400 300 800 400 T 1500 200"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 4"
          />
        </svg>
      </div>

      {/* Main Text Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full text-center -translate-y-26">
        <div className="space-y-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="cyber-tag"
          >
            COMPLIANCE-FIRST SECURITY
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-5xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
          >
            Bridge the Gap
            <br />
            Between Finding
            <br />
            and Fixing.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-muted-foreground text-lg max-w-2xl"
          >
            Sentinel doesn't just list bugs. We expose Shadow APIs, map vulnerabilities to GDPR & PCI-DSS standards, and provide instant code fixes for developers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
            >
              Start Free Audit
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8"
            >
              How Sentinel Works
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};