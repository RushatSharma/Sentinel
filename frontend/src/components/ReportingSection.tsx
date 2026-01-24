import { motion } from "framer-motion";
import { FileText, Download, Users, Code } from "lucide-react";
import { Button } from "./ui/button";

export function ReportingSection() {
  return (
    <section id="reporting" className="relative py-24 sm:py-32">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <FileText className="w-4 h-4 text-sentinel-blue" />
            <span className="text-sm font-medium text-muted-foreground">
              Executive Reporting
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Reports That{" "}
            <span className="text-gradient-dual">Bridge the Gap</span>
          </h2>

          <p className="text-lg text-muted-foreground">
            Generate PDF reports tailored for different audiences—from board-level 
            risk summaries to developer-focused technical breakdowns.
          </p>
        </motion.div>

        {/* Report Preview */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Executive Report */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sentinel-blue/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-sentinel-blue" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Executive Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For C-Suite & Board Members
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Mock Report Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Risk Level</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                    Medium
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Financial Exposure</span>
                  <span className="text-foreground font-medium">$2.4M potential</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Compliance Status</span>
                  <span className="text-sentinel-blue font-medium">87% compliant</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Key Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-sentinel-red">•</span>
                    Address 3 critical PCI-DSS violations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    Review Shadow API exposure on customer portal
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sentinel-blue">•</span>
                    Schedule quarterly security reviews
                  </li>
                </ul>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download Executive PDF
              </Button>
            </div>
          </motion.div>

          {/* Technical Report */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sentinel-red/10 flex items-center justify-center">
                  <Code className="w-5 h-5 text-sentinel-red" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Technical Breakdown
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For Security & Dev Teams
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Mock Code Block */}
              <div className="bg-background rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <div className="text-muted-foreground">// Shadow API Detected</div>
                <div className="text-sentinel-red">GET /api/v2/internal/users</div>
                <div className="text-muted-foreground mt-2">// Exposed in:</div>
                <div className="text-foreground">/static/js/bundle.js:4521</div>
                <div className="mt-2 text-muted-foreground">// Risk: High (Authentication Bypass)</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vulnerabilities Found</span>
                  <span className="text-foreground font-medium">47 total</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 rounded bg-sentinel-red/10 text-sentinel-red">12 Critical</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">18 High</span>
                  <span className="px-2 py-0.5 rounded bg-sentinel-blue/10 text-sentinel-blue">17 Medium</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Remediation Steps</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Implement API authentication middleware</li>
                  <li>Add rate limiting to exposed endpoints</li>
                  <li>Configure CORS policies for production</li>
                </ol>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download Technical PDF
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}