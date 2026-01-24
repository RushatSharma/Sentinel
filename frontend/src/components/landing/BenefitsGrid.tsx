import { motion } from "framer-motion";
import { Shield, Scale, Clock, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Audit-Ready Reporting",
    description: "Generate executive PDFs with one click, separating technical details from business risks.",
    size: "large",
  },
  {
    icon: Scale,
    title: "Legal Mapping",
    description: "Automatically translate technical bugs into legal liability scores.",
    size: "medium",
    highlight: true,
  },
  {
    icon: Clock,
    title: "Zero Setup Scan",
    description: "Point to a URL and start auditing immediately. No agents required.",
    size: "medium",
  },
  {
    icon: CheckCircle,
    title: "OWASP Top 10",
    description: "Full coverage for Injection, XSS, and Security Misconfigurations.",
    size: "small",
  },
];

export const BenefitsGrid = () => {
  return (
    // Added 'overflow-hidden' to fix horizontal scroll
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Security That Speaks
            <br />
            <span className="text-muted-foreground">Business Language</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Large card - spans 2 rows */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:row-span-2 glass-card p-8 flex flex-col"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-semibold mb-4">
              Audit-Ready Reporting
            </h3>
            <p className="text-muted-foreground flex-grow">
              Managers don't speak SQL Injection; they speak Risk. Sentinel translates 
              technical vulnerabilities into clear, actionable executive summaries 
              while providing developers with the exact line of code to fix.
            </p>
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Auto-generated PDF Reports</span>
              </div>
            </div>
          </motion.div>

          {/* Scale card - with green accent */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-8 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
              <Scale className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">
              Legal Mapping
            </h3>
            <p className="text-sm text-muted-foreground">
              Automatically translate technical bugs into GDPR, PCI-DSS, and OWASP violations.
            </p>
          </motion.div>

          {/* Clock card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">
              Zero Setup Scan
            </h3>
            <p className="text-sm text-muted-foreground">
              Just enter a target URL. No complex agents or installation required.
            </p>
          </motion.div>

          {/* Compliance card - spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 glass-card p-8 flex items-center gap-8"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold mb-2">
                OWASP Top 10 Coverage
              </h3>
              <p className="text-sm text-muted-foreground">
                Rigorous testing for Injection, XSS, Broken Access Control, and Security Misconfiguration.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};