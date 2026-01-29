import { motion } from "framer-motion";
import { ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import BusinessIdeaCard from "./BusinessIdeaCard";

interface BusinessIdea {
  id: string;
  name: string;
  description: string;
  problem: string;
  viabilityScore: number;
  profitPotential: string;
  timeToLaunch: string;
  startupCost: string;
  experienceNeeded: string;
  urgencyLevel: "critical" | "high" | "medium";
  tags: string[];
}

interface GeneratedIdeasProps {
  ideas: BusinessIdea[];
  onSelectIdea: (idea: BusinessIdea) => void;
  onRegenerate: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const GeneratedIdeas = ({ ideas, onSelectIdea, onRegenerate, onBack, isLoading }: GeneratedIdeasProps) => {
  return (
    <section className="relative min-h-screen py-20 px-4">
      <div className="absolute inset-0 bg-hero-glow opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Your Business Ideas
              </h2>
            </div>
            <p className="text-muted-foreground">
              AI-curated opportunities based on your profile. Click any idea to start building.
            </p>
          </div>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Generate More
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-24 mb-4" />
                <div className="h-8 bg-muted rounded w-3/4 mb-4" />
                <div className="h-16 bg-muted rounded mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Ideas Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <BusinessIdeaCard
                key={idea.id}
                idea={idea}
                index={index}
                onSelect={onSelectIdea}
              />
            ))}
          </div>
        )}

        {/* Pro Tip */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground mb-1">
                  Maximize Your Success
                </h4>
                <p className="text-sm text-muted-foreground">
                  Consider combining multiple revenue streams from these ideas. For example, 
                  pair a service-based business with a digital product for passive income.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default GeneratedIdeas;
