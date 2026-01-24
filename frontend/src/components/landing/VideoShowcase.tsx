import { motion } from "framer-motion";
import { Play } from "lucide-react";
import dashboard1 from "@/assets/dashboard-1.jpg";
import dashboard2 from "@/assets/dashboard-2.jpg";
import codeScan from "@/assets/code-scan.jpg";

const videos = [
  {
    image: dashboard1,
    label: "Built on Adaptive Intelligence",
  },
  {
    image: dashboard2,
    label: "Automated 24/7 Response",
  },
  {
    image: codeScan,
    label: "Seamless Across Any Stack",
  },
];

export const VideoShowcase = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute right-0 top-0 w-[400px] h-[400px] glow-orb opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header - right aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-right mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            We Evolve So You're
            <br />
            <span className="text-muted-foreground">Untouchable</span>
          </h2>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative rounded-xl overflow-hidden border border-border aspect-video">
                <img
                  src={video.image}
                  alt={video.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                  </button>
                </div>

                {/* Play indicator */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-foreground ml-0.5" />
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {video.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
