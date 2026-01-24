import { motion } from "framer-motion";
import hackerImage from "@/assets/hacker-image.jpg";

const stats = [
  { value: "3", label: "Global Standards (GDPR, PCI, OWASP)" },
  { value: "100%", label: "Compliance Mapping" },
  { value: "24/7", label: "Automated Remediation" },
];

export const MissionSection = () => {
  return (
    // Added 'overflow-hidden' to fix horizontal scroll
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border">
              <img
                src={hackerImage}
                alt="Cybersecurity audit"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              
              {/* Caption overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6"
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  Sentinel Audit Suite v2.0
                </p>
              </motion.div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-4 glow-orb opacity-30 -z-10 rounded-3xl" />
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* Tag */}
            <div className="cyber-tag text-primary border-primary/30">
              Our Mission
            </div>

            {/* Main text */}
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed uppercase">
              At Sentinel, we believe finding a bug is only half the battle.
              <span className="text-muted-foreground">
                {" "}True security means understanding the business impact and fixing it immediately.
              </span>
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="text-center lg:text-left"
                >
                  <p className="font-display text-3xl md:text-4xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};