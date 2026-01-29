import { motion } from "framer-motion";
import { Search, Scale, Wrench, FileCheck, Shield,} from "lucide-react";

const features = [
  {
    title: "Shadow API Hunter",
    description:
      "Crawls your JavaScript bundles to discover hidden /api/ endpoints that traditional scanners miss.",
    icon: Search,
    color: "blue" as const,
    size: "large" as const,
    code: `// Found hidden endpoint
fetch('/api/admin/users')
  .then(r => r.json())
  // ⚠️ Unauthenticated access`,
  },
  {
    title: "Legal Mapping",
    description:
      "Automatically maps vulnerabilities like SQLi to GDPR Art. 32, PCI-DSS 6.5, and more.",
    icon: Scale,
    color: "red" as const,
    size: "medium" as const,
  },
  {
    title: "Instant Fixes",
    description: "AI-generated code patches ready for your developers to review and ship.",
    icon: Wrench,
    color: "blue" as const,
    size: "medium" as const,
  },
  {
    title: "Executive Reports",
    description:
      "Generate polished PDF reports that separate business risk from technical details.",
    icon: FileCheck,
    color: "red" as const,
    size: "small" as const,
  },
  {
    title: "Real-time Monitoring",
    description: "Continuous scanning with instant alerts when new vulnerabilities emerge.",
    icon: Shield,
    color: "blue" as const,
    size: "small" as const,
  },
];

export const BentoGrid = () => {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Optional Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sentinel-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Offensive Discovery.{" "}
            <span className="text-sentinel-blue">Defensive Action.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete security suite that bridges the gap between red team
            reconnaissance and blue team compliance.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "large";
            const isBlue = feature.color === "blue";

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
                  ${isLarge ? "lg:col-span-2" : ""} {/* REMOVED: lg:row-span-2 */}
                  ${isBlue ? "feature-card-blue" : "feature-card-red"}
                  group cursor-pointer flex flex-col
                `}
              >
                {/* Layout Logic:
                  - If isLarge: 2-column grid (Text Left / Console Right)
                  - If Normal: Flex Column (Icon -> Title -> Desc)
                */}
                <div className={`h-full p-6 ${isLarge ? "grid grid-cols-1 md:grid-cols-2 gap-8 items-center" : "flex flex-col"}`}>
                  
                  {/* Left Side: Icon & Text */}
                  <div className={`flex flex-col ${isLarge ? "justify-center" : "h-full"}`}>
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                        isBlue
                          ? "bg-sentinel-blue/10 text-sentinel-blue group-hover:bg-sentinel-blue group-hover:text-white"
                          : "bg-sentinel-red/10 text-sentinel-red group-hover:bg-sentinel-red group-hover:text-white"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base text-muted-foreground flex-1">{feature.description}</p>
                  </div>

                  {/* Right Side: Console (Only for Large cards) */}
                  {isLarge && feature.code && (
                    <div className="terminal-window w-full h-fit shadow-lg mt-0">
                      <div className="terminal-header">
                        <div className="terminal-dot bg-destructive" />
                        <div className="terminal-dot bg-terminal-yellow" />
                        <div className="terminal-dot bg-terminal-green" />
                        <span className="ml-2 text-xs text-muted-foreground">
                          scan-result.js
                        </span>
                      </div>
                      <pre className="p-4 text-sm text-terminal-text overflow-x-auto bg-black/50">
                        <code>{feature.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};