import { motion } from "framer-motion";
import { Shield, Scale, Clock, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Future-Proof Your Security",
    description: "Stay ahead of emerging threats with adaptive protection that evolves.",
    size: "large",
  },
  {
    icon: Scale,
    title: "Scale Without Fear",
    description: "Grow your infrastructure confidently with security that scales with you.",
    size: "medium",
    highlight: true,
  },
  {
    icon: Clock,
    title: "Stay Safe, Even While You Sleep",
    description: "24/7 automated monitoring and response keeps you protected around the clock.",
    size: "medium",
  },
  {
    icon: CheckCircle,
    title: "Compliance Made Simple",
    description: "Meet regulatory requirements with built-in compliance frameworks.",
    size: "small",
  },
];

export const BenefitsGrid = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Protection That Gets
            <br />
            <span className="text-muted-foreground">Smarter With You</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Large card - spans 2 rows */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:row-span-2 glass-card p-8 flex flex-col"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-semibold mb-4">
              Future-Proof Your Security
            </h3>
            <p className="text-muted-foreground flex-grow">
              Stay ahead of emerging threats with adaptive protection that evolves 
              alongside the ever-changing cyber landscape. Our AI-driven system 
              anticipates vulnerabilities before they become exploits.
            </p>
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Real-time threat intelligence</span>
              </div>
            </div>
          </motion.div>

          {/* Scale card - with green accent */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-8 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
              <Scale className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">
              Scale Without Fear
            </h3>
            <p className="text-sm text-muted-foreground">
              Grow your infrastructure confidently with security that scales seamlessly.
            </p>
          </motion.div>

          {/* Clock card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">
              Stay Safe, Even While You Sleep
            </h3>
            <p className="text-sm text-muted-foreground">
              24/7 automated monitoring keeps you protected around the clock.
            </p>
          </motion.div>

          {/* Compliance card - spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 glass-card p-8 flex items-center gap-8"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold mb-2">
                Compliance Made Simple
              </h3>
              <p className="text-sm text-muted-foreground">
                Meet regulatory requirements effortlessly with built-in compliance frameworks 
                for SOC 2, GDPR, HIPAA, and more.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
