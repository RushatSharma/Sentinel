import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import codeScanImage from "@/assets/code-scan.jpg";
import dashboardImage from "@/assets/dashboard-2.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const FeatureGrid = () => {
  return (
    // Added 'overflow-hidden' to fix horizontal scroll
    <section id="services" className="py-24 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] glow-orb opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Offensive Scanning,
            <br />
            <span className="text-muted-foreground">Defensive Reporting</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Card 1 - Shadow API Hunter */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-6 space-y-4"
          >
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={codeScanImage}
                alt="Shadow API scanning"
                className="w-full h-40 object-cover"
              />
            </div>
            <h3 className="font-display text-xl font-semibold">
              Shadow API Hunter
            </h3>
            <p className="text-sm text-muted-foreground">
              Regex-powered crawler that extracts hidden /api/ endpoints and forgotten routes from client-side JavaScript.
            </p>
          </motion.div>

          {/* Card 2 - Compliance Engine (Center) */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-6 flex flex-col items-center justify-center text-center border-glow"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <div className="w-8 h-8 rounded-full bg-primary animate-pulse-glow" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-4">
              Automated Compliance
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Don't just find SQLi. Map it directly to GDPR Art. 32 and PCI-DSS Requirement 6.5 violations.
            </p>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              View Sample Report
            </Button>
          </motion.div>

          {/* Card 3 - Developer Remediation */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-6 space-y-4"
          >
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={dashboardImage}
                alt="Remediation dashboard"
                className="w-full h-40 object-cover"
              />
            </div>
            <h3 className="font-display text-xl font-semibold">
              Instant Remediation
            </h3>
            <p className="text-sm text-muted-foreground">
              We provide static code templates and best practices to fix vulnerabilities the moment they are found.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};