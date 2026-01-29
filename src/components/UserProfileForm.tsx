import { motion } from "framer-motion";
import { User, DollarSign, Briefcase, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface UserProfile {
  expertise: string;
  interests: string;
  budget: string;
  skills: string;
}

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  mode: "generate" | "validate";
  onBack: () => void;
}

const expertiseLevels = [
  { value: "beginner", label: "Beginner", description: "New to entrepreneurship" },
  { value: "intermediate", label: "Intermediate", description: "Some business experience" },
  { value: "experienced", label: "Experienced", description: "Multiple ventures" },
  { value: "serial", label: "Serial Entrepreneur", description: "Built & exited businesses" },
];

const budgetRanges = [
  { value: "$0-$100", label: "$0 - $100", description: "Bootstrap" },
  { value: "$100-$500", label: "$100 - $500", description: "Minimal investment" },
  { value: "$500-$1000", label: "$500 - $1,000", description: "Moderate" },
  { value: "$1000-$2000", label: "$1,000 - $2,000", description: "Full launch" },
];

const UserProfileForm = ({ onSubmit, mode, onBack }: UserProfileFormProps) => {
  const [profile, setProfile] = useState<UserProfile>({
    expertise: "",
    interests: "",
    budget: "",
    skills: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  const isValid = profile.expertise && profile.interests && profile.budget;

  return (
    <section className="relative min-h-screen py-20 px-4">
      <div className="absolute inset-0 bg-hero-glow opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-3xl mx-auto"
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="glass-card p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            {mode === "generate" ? (
              <Sparkles className="w-8 h-8 text-primary" />
            ) : (
              <Lightbulb className="w-8 h-8 text-success" />
            )}
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {mode === "generate" ? "Let's Find Your Perfect Business" : "Validate Your Vision"}
            </h2>
          </div>
          <p className="text-muted-foreground mb-8">
            {mode === "generate"
              ? "Tell us about yourself so we can generate personalized, high-potential business ideas."
              : "Share your background and we'll analyze your idea's market potential."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Expertise Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <User className="w-4 h-4 text-primary" />
                Experience Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {expertiseLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setProfile({ ...profile, expertise: level.value })}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                      profile.expertise === level.value
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-sm">{level.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <Briefcase className="w-4 h-4 text-primary" />
                Interests & Industries
              </label>
              <textarea
                value={profile.interests}
                onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                placeholder="e.g., AI technology, health & wellness, e-commerce, content creation, SaaS..."
                className="input-field min-h-[100px] resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                Your Skills & Strengths
              </label>
              <input
                type="text"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                placeholder="e.g., marketing, coding, design, sales, writing..."
                className="input-field"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <DollarSign className="w-4 h-4 text-primary" />
                Launch Budget
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {budgetRanges.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => setProfile({ ...profile, budget: range.value })}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                      profile.budget === range.value
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-sm">{range.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{range.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid}
              className={`btn-primary w-full text-lg py-4 ${
                !isValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {mode === "generate" ? "Generate Business Ideas" : "Continue to Validate"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default UserProfileForm;
