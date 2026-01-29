import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Clock, Zap, Target, ArrowRight, Star } from "lucide-react";

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

interface BusinessIdeaCardProps {
  idea: BusinessIdea;
  index: number;
  onSelect: (idea: BusinessIdea) => void;
}

const BusinessIdeaCard = ({ idea, index, onSelect }: BusinessIdeaCardProps) => {
  const getViabilityClass = (score: number) => {
    if (score >= 80) return "viability-high";
    if (score >= 60) return "viability-medium";
    return "viability-low";
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-destructive";
      case "high":
        return "text-success";
      default:
        return "text-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card glow-border p-6 hover:translate-y-[-4px] transition-all duration-300 cursor-pointer group"
      onClick={() => onSelect(idea)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`viability-score ${getViabilityClass(idea.viabilityScore)}`}>
              <Star className="w-3.5 h-3.5" />
              {idea.viabilityScore}% Viable
            </span>
            <span className={`text-xs font-medium ${getUrgencyColor(idea.urgencyLevel)}`}>
              {idea.urgencyLevel.charAt(0).toUpperCase() + idea.urgencyLevel.slice(1)} Demand
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-gradient transition-all">
            {idea.name}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {idea.description}
      </p>

      {/* Problem Badge */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
        <div className="flex items-center gap-2 text-xs text-primary font-medium mb-1">
          <Target className="w-3 h-3" />
          Problem Solved
        </div>
        <p className="text-sm text-foreground/80">{idea.problem}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Profit:</span>
          <span className="font-medium text-foreground">{idea.profitPotential}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Launch:</span>
          <span className="font-medium text-foreground">{idea.timeToLaunch}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Cost:</span>
          <span className="font-medium text-foreground">{idea.startupCost}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Level:</span>
          <span className="font-medium text-foreground">{idea.experienceNeeded}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {idea.tags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-1 text-xs rounded-full bg-secondary/50 text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-sm text-muted-foreground">Build this business</span>
        <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};

export default BusinessIdeaCard;
