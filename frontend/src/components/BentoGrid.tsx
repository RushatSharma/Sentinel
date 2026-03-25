import { motion } from "framer-motion";
import { Search, Key, LineChart, Network, Zap } from "lucide-react";

const features = [
  {
    title: "SSL/TLS Crypto Analyzer",
    description:
      "Extracts X.509 chains, evaluates cipher strength, and detects obsolete protocols. Includes a rigorous A-F security grading engine.",
    icon: Key,
    color: "blue" as const,
    size: "large" as const,
    code: `[SYSTEM] Initializing Crypto Handshake...
[NETWORK] Resolving target: sentinel.local
[CRYPTO] Extracting X.509 Certificate Chain...
[PROBE] Downgrade Attack Simulation: FAILED (Secure)
[RESULT] Cipher Suite: TLS_AES_256_GCM_SHA384
============================================
[SECURITY GRADE] : A 
============================================`,
  },
  {
    title: "Shadow API Hunter",
    description:
      "Crawls your JavaScript bundles to discover hidden /api/ endpoints that traditional scanners miss.",
    icon: Search,
    color: "red" as const,
    size: "medium" as const,
  },
  {
    title: "Financial Risk Scoring",
    description: "Translates technical CVSS metrics into estimated financial impact to prioritize critical patching.",
    icon: LineChart,
    color: "blue" as const,
    size: "medium" as const,
  },
  {
    title: "OSINT Reconnaissance",
    description:
      "Map your external attack surface and discover hidden subdomains before threat actors do.",
    icon: Network,
    color: "red" as const,
    size: "small" as const,
  },
  {
    title: "Swagger Fuzzing",
    description: "Ingest Swagger UI docs to automatically fuzz API endpoints and uncover injection flaws.",
    icon: Zap,
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
            reconnaissance and blue team remediation.
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
                  ${isLarge ? "lg:col-span-2" : ""}
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
                      <div className="terminal-header border-b border-white/10 pb-2 mb-2">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground font-mono">
                          crypto_engine.log
                        </span>
                      </div>
                      <pre className="p-2 text-xs md:text-sm text-cyan-400 overflow-x-auto bg-black/50 font-mono">
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