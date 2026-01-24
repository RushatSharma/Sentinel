import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const terminalLines = [
  { text: "$ sentinel scan https://target.com", type: "command", delay: 0 },
  { text: "Initializing Shadow API Hunter...", type: "info", delay: 800 },
  { text: "Crawling JavaScript bundles...", type: "info", delay: 1500 },
  { text: "", type: "blank", delay: 2000 },
  { text: "⚠️  Shadow API found: /api/admin/users", type: "warning", delay: 2300 },
  { text: "⚠️  Shadow API found: /api/internal/debug", type: "warning", delay: 2800 },
  { text: "", type: "blank", delay: 3200 },
  { text: "Mapping to compliance frameworks...", type: "info", delay: 3500 },
  { text: "✓ GDPR Art. 32 - Unauthorized data access risk", type: "success", delay: 4000 },
  { text: "✓ PCI-DSS 6.5.1 - Injection vulnerability", type: "success", delay: 4400 },
  { text: "", type: "blank", delay: 4800 },
  { text: "Generating remediation...", type: "info", delay: 5200 },
  { text: "✓ Fix generated: Add authentication middleware", type: "success", delay: 5800 },
  { text: "✓ Report ready: sentinel-report-2024.pdf", type: "success", delay: 6200 },
];

export const InteractiveTerminal = () => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    const timeouts: NodeJS.Timeout[] = [];
    
    terminalLines.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setVisibleLines(index + 1);
      }, line.delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isInView]);

  const getLineColor = (type: string) => {
    switch (type) {
      case "command":
        return "text-sentinel-blue";
      case "warning":
        return "text-terminal-yellow";
      case "success":
        return "text-terminal-green";
      case "info":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
       {/* Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-sentinel-blue/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Watch Sentinel <span className="text-sentinel-red">Hunt</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our scanner crawls your codebase like an attacker would—finding
              hidden APIs, mapping them to compliance violations, and generating
              fixes your team can ship immediately.
            </p>
            <ul className="space-y-4">
              {[
                "Deep JavaScript bundle analysis",
                "Automatic compliance framework mapping",
                "AI-powered remediation suggestions",
                "Executive-ready PDF reports",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-sentinel-blue rounded-full shadow-[0_0_10px_hsl(var(--defense-blue))]" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onViewportEnter={() => setIsInView(true)}
            className="terminal-window shadow-2xl relative z-10"
          >
            <div className="terminal-header">
              <div className="terminal-dot bg-destructive" />
              <div className="terminal-dot bg-terminal-yellow" />
              <div className="terminal-dot bg-terminal-green" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">
                sentinel-cli
              </span>
            </div>
            <div className="p-6 min-h-[400px] font-mono text-sm bg-black/50 backdrop-blur-sm">
              {terminalLines.slice(0, visibleLines).map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`${getLineColor(line.type)} ${
                    line.type === "blank" ? "h-4" : "mb-1"
                  }`}
                >
                  {line.text}
                </motion.div>
              ))}
              {visibleLines < terminalLines.length && (
                <span className="inline-block w-2 h-5 bg-sentinel-blue animate-typing-cursor" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};