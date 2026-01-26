import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Scale } from "lucide-react";

const complianceItems = [
  {
    standard: "GDPR Art. 32",
    title: "Security of Processing",
    description: "Automatic mapping of vulnerabilities to data protection requirements",
    status: "mapped",
  },
  {
    standard: "PCI-DSS 6.5",
    title: "Secure Development",
    description: "Identify coding flaws and insecure development practices",
    status: "mapped",
  },
  {
    standard: "SOC 2",
    title: "Trust Services Criteria",
    description: "Evidence collection for security, availability, and confidentiality",
    status: "mapped",
  },
];

export function ComplianceSection() {
  return (
    <section id="compliance" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-5xl mx-auto mb-16"
        >
          {/* Badge: Explicit bg-card */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm mb-6">
            <Scale className="w-4 h-4 text-sentinel-blue" />
            <span className="text-sm font-medium text-muted-foreground">
              Compliance Automation
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            From Vulnerability to{" "}
            <span className="text-gradient-blue">Compliance Violation</span>
          </h2>

          <p className="text-lg text-muted-foreground">
            Stop manually mapping findings to compliance frameworks. Sentinel 
            automatically correlates vulnerabilities to regulatory requirements, 
            saving hours of audit preparation.
          </p>
        </motion.div>

        {/* --- GRID LAYOUT --- */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Stack of 3 Horizontal Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {complianceItems.map((item, index) => (
              <motion.div
                key={item.standard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                // Card: Explicit bg-card
                className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-sentinel-blue/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-sentinel-blue" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-sentinel-blue uppercase tracking-wide">
                      {item.standard}
                    </span>
                  </div>
                  <h4 className="font-display text-xl font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-base text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* RIGHT COLUMN: Compliance Score Only */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Card 1: Compliance Score - Explicit bg-card */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Compliance Score
                  </h3>
                  <span className="text-2xl font-bold text-sentinel-blue">87%</span>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-muted-foreground">GDPR Compliance</span>
                      <span className="text-foreground font-medium">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-sentinel-blue rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "92%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-muted-foreground">PCI-DSS Compliance</span>
                      <span className="text-foreground font-medium">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-sentinel-red to-yellow-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "78%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-muted-foreground">SOC 2 Readiness</span>
                      <span className="text-foreground font-medium">91%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-sentinel-blue rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "91%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Alert */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-sentinel-red/10 border border-sentinel-red/20">
                  <AlertTriangle className="w-5 h-5 text-sentinel-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-medium text-foreground">
                      3 Critical Violations Detected
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PCI-DSS 6.5.1, 6.5.7, 6.5.10 require immediate attention
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-sentinel-blue/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-sentinel-red/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}