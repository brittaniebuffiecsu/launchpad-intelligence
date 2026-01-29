import { motion } from "framer-motion";
import { Brain, TrendingUp, Search, Database, Sparkles } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

const loadingSteps = [
  { icon: Search, text: "Analyzing market trends..." },
  { icon: Database, text: "Scanning profitable niches..." },
  { icon: TrendingUp, text: "Calculating viability scores..." },
  { icon: Brain, text: "Generating personalized ideas..." },
  { icon: Sparkles, text: "Finalizing recommendations..." },
];

const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-hero-glow" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Animated Brain */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-primary/20"
          />
          <motion.div
            animate={{
              scale: [1.1, 1.2, 1.1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="absolute inset-[-20px] rounded-full bg-primary/10"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-16 h-16 text-primary" />
          </div>
        </div>

        <h3 className="font-display text-2xl font-bold text-foreground mb-4">
          {message || "AI is Working..."}
        </h3>

        {/* Loading Steps */}
        <div className="space-y-3">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.4 }}
              className="flex items-center gap-3 justify-center text-muted-foreground"
            >
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                <step.icon className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm">{step.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LoadingState;
