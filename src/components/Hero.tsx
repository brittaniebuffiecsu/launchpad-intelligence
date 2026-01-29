import { motion } from "framer-motion";
import { Sparkles, Rocket, TrendingUp } from "lucide-react";

interface HeroProps {
  onGenerateClick: () => void;
  onValidateClick: () => void;
}

const Hero = ({ onGenerateClick, onValidateClick }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="floating-orb w-96 h-96 bg-primary/30 -top-48 -left-48" style={{ animationDelay: "0s" }} />
      <div className="floating-orb w-64 h-64 bg-primary/20 top-1/4 right-0" style={{ animationDelay: "2s" }} />
      <div className="floating-orb w-80 h-80 bg-success/10 bottom-0 left-1/4" style={{ animationDelay: "4s" }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Business Intelligence</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">Build Your</span>
          <br />
          <span className="text-gradient">Billion-Dollar Idea</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          From ideation to launch. AI analyzes markets, validates concepts, and builds your business infrastructure in minutes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button onClick={onGenerateClick} className="btn-primary text-lg group">
            <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Generate Business Ideas
          </button>
          <button onClick={onValidateClick} className="btn-secondary text-lg group">
            <TrendingUp className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Validate My Idea
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
        >
          {[
            { value: "10K+", label: "Ideas Generated" },
            { value: "94%", label: "Success Rate" },
            { value: "$2.4M", label: "Revenue Created" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
