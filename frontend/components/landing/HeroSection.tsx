import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Orb Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large right orb */}
        <div className="absolute -right-1/4 top-1/4 w-[800px] h-[800px] rounded-full glow-orb opacity-60 animate-pulse-glow" />
        
        {/* Orbital ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute right-0 top-20 w-[600px] h-[600px]"
        >
          <div className="w-full h-full rounded-full border border-primary/20" />
          <div className="absolute top-1/2 right-0 w-3 h-3 bg-primary rounded-full transform -translate-y-1/2 translate-x-1/2" />
        </motion.div>

        {/* Bottom left accent dot */}
        <div className="absolute left-1/4 bottom-20 w-2 h-2 bg-primary rounded-full" />

        {/* Curved lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: 0.5 }}
            d="M-100 600 Q 400 300 800 400 T 1500 200"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            fill="none"
            strokeDasharray="8 4"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Play button and text */}
          <div className="flex items-center gap-8">
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            >
              <Play className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground ml-1" fill="currentColor" />
            </motion.button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 md:w-24 h-px bg-primary/50" />
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground"
              >
                Adaptive Security.
              </motion.p>
            </div>
          </div>

          {/* Right side - Main content */}
          <div className="space-y-8">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="cyber-tag"
            >
              CYBER SECURITY NO. #1
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
            >
              Cyber Defense
              <br />
              That Evolves
              <br />
              Daily.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-muted-foreground text-lg max-w-lg"
            >
              AI-driven protection that learns, adapts, and grows stronger every single
              day—so you stay one step ahead of every digital threat.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
              >
                Get Protected Today
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8"
              >
                How Oryn Works
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
