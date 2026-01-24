import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { OrbitalRing } from "./OrbitalRing"; // Ensure you copy OrbitalRing.tsx from the files I fetched!

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 grid-background" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <OrbitalRing />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sentinel-blue" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">Red Team × Blue Team Integration</span>
          </div>
          <h1 className="font-display text-4xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Bridge the Gap Between</span><br />
            <span className="text-gradient-red">Finding</span> <span className="text-foreground">and</span> <span className="text-gradient-blue">Fixing</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            The compliance-first security platform that discovers Shadow APIs, maps vulnerabilities to GDPR & PCI-DSS, and generates executive-ready reports.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="sentinel" size="lg" className="group">
                Start Free Audit <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg"> <Play className="mr-2 h-4 w-4" /> View Demo </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}