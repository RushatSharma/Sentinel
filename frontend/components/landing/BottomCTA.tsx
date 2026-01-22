import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import dashboard1 from "@/assets/dashboard-1.jpg";
import dashboard2 from "@/assets/dashboard-2.jpg";

export const BottomCTA = () => {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-card to-background"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-1/2 h-full glow-orb opacity-20 pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Text */}
              <div className="space-y-6">
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Ready to
                  <br />
                  Outsmart
                  <br />
                  Tomorrow's
                  <br />
                  <span className="text-muted-foreground">Threats?</span>
                </h2>

                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 group"
                >
                  Get Protected Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Right - Image collage */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="rounded-xl overflow-hidden border border-border"
                  >
                    <img
                      src={dashboard1}
                      alt="Security dashboard"
                      className="w-full h-32 md:h-40 object-cover"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="rounded-xl overflow-hidden border border-border mt-8"
                  >
                    <img
                      src={dashboard2}
                      alt="Network visualization"
                      className="w-full h-32 md:h-40 object-cover"
                    />
                  </motion.div>
                </div>

                {/* Floating accent */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 border border-primary/30 rounded-full" />
                <div className="absolute -top-4 -left-4 w-3 h-3 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
