import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Oryn's adaptive security transformed our infrastructure. Threats that would have taken hours to detect are now neutralized in seconds.",
    author: "Sarah Chen",
    role: "CTO, TechFlow Inc",
  },
  {
    quote: "The peace of mind knowing our systems are protected 24/7 by AI that actually learns and improves is invaluable.",
    author: "Marcus Rodriguez",
    role: "Security Director, DataVault",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="cyber-tag text-primary border-primary/30">
              Testimonials
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Trusted by
              <br />
              <span className="text-muted-foreground">the Vigilant</span>
            </h2>
          </motion.div>

          {/* Right - Testimonial Cards */}
          <div className="grid gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-8 relative"
              >
                {/* Large quote mark */}
                <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/20" />

                <blockquote className="text-lg md:text-xl font-medium mb-6 relative z-10">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="font-display font-bold text-primary">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
