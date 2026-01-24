import { motion } from "framer-motion";
import { Radar, ShieldCheck, FileText, Search, Lock, Zap } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Radar,
    title: "Shadow API Hunter",
    description:
      "Automatically crawl JavaScript files to discover hidden /api/ endpoints that bypass traditional security controls. Find what attackers find first.",
    accentColor: "red" as const,
  },
  {
    icon: ShieldCheck,
    title: "Automated Compliance",
    description:
      "Map every vulnerability to GDPR Art. 32 and PCI-DSS Req. 6.5 violations automatically. Stay audit-ready without manual compliance mapping.",
    accentColor: "blue" as const,
  },
  {
    icon: FileText,
    title: "Executive Reporting",
    description:
      "Generate PDF reports that separate technical findings from business risk. Give executives the insights they need, developers the details they want.",
    accentColor: "blue" as const,
  },
  {
    icon: Search,
    title: "Deep Vulnerability Scanning",
    description:
      "Go beyond surface-level scans with intelligent crawling that understands modern JavaScript frameworks and API patterns.",
    accentColor: "red" as const,
  },
  {
    icon: Lock,
    title: "Remediation Workflows",
    description:
      "Bridge Red and Blue teams with actionable remediation steps, priority scoring, and integrated ticketing for seamless handoffs.",
    accentColor: "blue" as const,
  },
  {
    icon: Zap,
    title: "Real-time Monitoring",
    description:
      "Continuous security posture assessment with instant alerts when new vulnerabilities or exposed endpoints are detected.",
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
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Unified Security{" "}
            <span className="text-gradient-dual">Intelligence</span>
          </h2>
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