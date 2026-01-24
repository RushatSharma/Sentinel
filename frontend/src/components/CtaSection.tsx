import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Dark Background base */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Central Blue Glow Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, hsl(var(--defense-blue) / 0.2) 0%, transparent 60%)",
        }}
      />
      
      {/* Subtle Grid Texture Overlay */}
      <div className="absolute inset-0 grid-background opacity-20" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            See Sentinel in action.
          </h2>
          <p className="text-xl sm:text-2xl text-foreground/90 mb-12 font-light">
            Secure your applications today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Get Started Button */}
            <Link to="/dashboard">
              <Button 
                variant="sentinel" 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px] rounded-full text-lg font-semibold h-14 px-10"
              >
                Get Started
              </Button>
            </Link>
            
            {/* Book a Demo Button (using new outline variant) */}
            <Link to="#"> {/* Replace '#' with your demo link if you have one */}
              <Button 
                variant="outline-sentinel" 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px] rounded-full text-lg font-semibold h-14 px-10 border-2"
              >
                Book a Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}