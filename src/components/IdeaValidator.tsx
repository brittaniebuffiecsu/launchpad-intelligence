import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Target, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface IdeaValidatorProps {
  userProfile: {
    expertise: string;
    interests: string;
    budget: string;
    skills: string;
  };
  onValidate: (idea: string) => void;
  onBack: () => void;
}

const IdeaValidator = ({ userProfile, onValidate, onBack }: IdeaValidatorProps) => {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onValidate(idea);
    }
  };

  return (
    <section className="relative min-h-screen py-20 px-4">
      <div className="absolute inset-0 bg-hero-glow opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-3xl mx-auto"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="glass-card p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-success" />
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Describe Your Business Idea
            </h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Tell us about your concept and we'll analyze its market potential, viability, and profitability.
          </p>

          {/* User context */}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Experience</div>
                <div className="text-sm font-medium capitalize">{userProfile.expertise}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Budget</div>
                <div className="text-sm font-medium">{userProfile.budget}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Focus</div>
                <div className="text-sm font-medium truncate">{userProfile.interests.split(",")[0]}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Your Business Idea
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your business idea in detail. What problem does it solve? Who is your target customer? What makes it unique?

Example: An AI-powered meal planning app that creates personalized weekly menus based on dietary restrictions, budget, and local grocery sales..."
                className="input-field min-h-[200px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!idea.trim()}
              className={`btn-primary w-full text-lg py-4 ${
                !idea.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Analyze My Idea
              <TrendingUp className="w-5 h-5 ml-2" />
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default IdeaValidator;
