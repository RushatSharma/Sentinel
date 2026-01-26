// frontend/src/components/ComplianceTicker.tsx
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const complianceStandards = [
  "GDPR",
  "PCI-DSS",
  "OWASP Top 10",
  "HIPAA",
  "SOC 2",
  "ISO 27001",
  "NIST CSF",
  "CIS Controls",
  "CCPA",
  "FedRAMP",
];

export const ComplianceTicker = () => {
  // Duplicate the array to create a seamless infinite loop
  const items = [...complianceStandards, ...complianceStandards];

  return (
    // UPDATED: 'bg-background' (solid) instead of bg-black/20
    <section className="py-16 relative overflow-hidden border-y border-border bg-background">
      <div className="container px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
            Compliance Frameworks Supported
          </p>
        </motion.div>
      </div>

      {/* Ticker Container */}
      <div className="relative">
        {/* Gradient Masks (Fade out edges) - kept as they blend to background */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Moving Track */}
        <motion.div
          className="flex gap-8 animate-ticker"
          style={{ width: "fit-content" }}
        >
          {items.map((standard, index) => (
            <div
              key={`${standard}-${index}`}
              // UPDATED: 'bg-card' (solid) instead of 'glass'
              className="flex items-center gap-3 bg-card border border-border px-6 py-3 rounded-full whitespace-nowrap group hover:border-sentinel-blue/50 transition-all duration-300 cursor-default shadow-sm"
            >
              <Shield className="w-4 h-4 text-sentinel-blue group-hover:scale-110 transition-transform" />
              <span className="font-display font-semibold text-foreground">
                {standard}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};