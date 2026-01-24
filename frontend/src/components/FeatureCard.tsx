import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: "blue" | "red";
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, accentColor, index }: FeatureCardProps) {
  const isBlue = accentColor === "blue";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="glass-card p-6 sm:p-8 h-full transition-all duration-300 hover:border-opacity-50">
        {/* Glow Effect */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isBlue ? "bg-sentinel-blue/5" : "bg-sentinel-red/5"
          }`}
        />

        {/* Icon */}
        <div
          className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
            isBlue ? "bg-sentinel-blue/10" : "bg-sentinel-red/10"
          }`}
        >
          <Icon className={`w-6 h-6 ${isBlue ? "text-sentinel-blue" : "text-sentinel-red"}`} />
          <div
            className={`absolute inset-0 rounded-xl blur-xl opacity-50 ${
              isBlue ? "bg-sentinel-blue/30" : "bg-sentinel-red/30"
            }`}
          />
        </div>

        {/* Content */}
        <h3 className="font-display text-xl font-semibold text-foreground mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Bottom Accent Line */}
        <div
          className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isBlue
              ? "bg-gradient-to-r from-transparent via-sentinel-blue to-transparent"
              : "bg-gradient-to-r from-transparent via-sentinel-red to-transparent"
          }`}
        />
      </div>
    </motion.div>
  );
}