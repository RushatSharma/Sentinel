import { motion } from "framer-motion";
import { FeatureCard } from "./FeatureCard";
import { Radar, Key, Network, Zap, LineChart, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Radar,
    title: "Shadow API Hunter",
    description:
      "Automatically crawl JavaScript files to discover hidden /api/ endpoints that bypass traditional security controls. Find what attackers find first.",
    accentColor: "blue" as const,
  },
  {
    icon: Key,
    title: "SSL/TLS Crypto Analyzer",
    description:
      "Extract X.509 certificate chains, evaluate cipher suite strength, and detect obsolete protocols vulnerable to downgrade attacks.",
    accentColor: "red" as const,
  },
  {
    icon: Network,
    title: "OSINT Reconnaissance",
    description:
      "Map your external attack surface. Discover hidden subdomains and external infrastructure footprints before threat actors do.",
    accentColor: "blue" as const,
  },
  {
    icon: Zap,
    title: "Swagger API Fuzzing",
    description:
      "Ingest Swagger UI documentation to automatically fuzz API endpoints, uncovering broken access controls and deep injection flaws.",
    accentColor: "red" as const,
  },
  {
    icon: LineChart,
    title: "Financial Risk Scoring",
    description:
      "Translate technical CVSS metrics into estimated financial impact to help executives and board members prioritize critical patching.",
    accentColor: "blue" as const,
  },
  {
    icon: ShieldCheck,
    title: "Automated Compliance",
    description:
      "Map every vulnerability to GDPR Art. 32 and PCI-DSS violations automatically. Stay audit-ready without manual compliance mapping.",
    accentColor: "red" as const,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {/* STANDARD HEADING SIZE */}
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Unified Security{" "}
            <span className="text-gradient-dual">Intelligence</span>
          </h2>
          {/* STANDARD DESCRIPTION SIZE */}
          <p className="text-lg text-muted-foreground">
            One platform that speaks both Red Team and Blue Team. From offensive 
            scanning to defensive remediation, Sentinel covers every angle.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}