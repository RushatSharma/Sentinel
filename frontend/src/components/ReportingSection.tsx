import { motion } from "framer-motion";
import { FileText, Users, Code } from "lucide-react";

export function ReportingSection() {
  return (
    <section id="reporting" className="relative py-24 sm:py-32 overflow-hidden">
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
          {/* Badge: Explicit bg-card */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-sm mb-4">
            <FileText className="w-4 h-4 text-sentinel-blue" />
            <span className="text-sm font-medium text-muted-foreground">
              Executive Reporting
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Reports That{" "}
            <span className="text-gradient-dual">Bridge the Gap</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate PDF reports tailored for different audiences—from board-level 
            risk summaries to developer-focused technical breakdowns.
          </p>
        </motion.div>

        {/* Report Preview */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Executive Report Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            {/* Card: Explicit bg-card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sentinel-blue/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-sentinel-blue" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      Executive Summary
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      For C-Suite & Board Members
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {/* Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground">Overall Risk Level</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      Medium
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground">Financial Exposure</span>
                    <span className="text-foreground font-medium">$2.4M potential</span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground">Compliance Status</span>
                    <span className="text-sentinel-blue font-medium">87% compliant</span>
                  </div>
                </div>

                {/* Recommendations List */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-base font-medium text-foreground mb-3">Key Recommendations</h4>
                  <ul className="space-y-2 text-base text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-sentinel-red mt-1.5">•</span>
                      Address 3 critical PCI-DSS violations
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1.5">•</span>
                      Review Shadow API exposure
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sentinel-blue mt-1.5">•</span>
                      Schedule quarterly security reviews
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Technical Report Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            {/* Card: Explicit bg-card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sentinel-red/10 flex items-center justify-center">
                    <Code className="w-5 h-5 text-sentinel-red" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      Technical Breakdown
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      For Security & Dev Teams
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {/* Code Snippet */}
                <div className="bg-background rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <div className="text-muted-foreground">// Shadow API Detected</div>
                  <div className="text-sentinel-red">GET /api/v2/internal/users</div>
                  <div className="text-muted-foreground mt-2">// Exposed in:</div>
                  <div className="text-foreground">/static/js/bundle.js:4521</div>
                </div>

                {/* Stats Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground">Vulnerabilities Found</span>
                    <span className="text-foreground font-medium">47 total</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-sentinel-red/10 text-sentinel-red">12 Critical</span>
                    <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">18 High</span>
                    <span className="px-2 py-1 rounded bg-sentinel-blue/10 text-sentinel-blue">17 Medium</span>
                  </div>
                </div>

                {/* Remediation Steps */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-base font-medium text-foreground mb-3">Remediation Steps</h4>
                  <ol className="space-y-2 text-base text-muted-foreground list-decimal list-inside">
                    <li>Implement API authentication middleware</li>
                    <li>Add rate limiting to exposed endpoints</li>
                    <li>Configure CORS policies for production</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}