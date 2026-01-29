import { useState } from "react";
import Hero from "../components/Hero";
import UserProfileForm from "../components/UserProfileForm";
import IdeaValidator from "../components/IdeaValidator";
import GeneratedIdeas from "../components/GeneratedIdeas";
import LoadingState from "../components/LoadingState";

// Demo data for generated ideas
const sampleIdeas = [
  {
    id: "1",
    name: "AI Content Repurposing Agency",
    description: "Transform long-form content into 50+ micro-content pieces using AI automation. Serve busy creators and businesses who need consistent social presence.",
    problem: "Creators spend 10+ hours weekly on content repurposing. Businesses struggle to maintain multi-platform presence without large teams.",
    viabilityScore: 92,
    profitPotential: "$15K-50K/mo",
    timeToLaunch: "1-2 weeks",
    startupCost: "$100-300",
    experienceNeeded: "Beginner",
    urgencyLevel: "critical" as const,
    tags: ["AI", "Content", "Agency", "Recurring Revenue"],
  },
  {
    id: "2",
    name: "Local Business AI Chatbot Setup",
    description: "Provide turnkey AI chatbot solutions for local businesses. Handle customer inquiries, bookings, and lead capture 24/7.",
    problem: "Small businesses lose 60% of leads outside business hours. Can't afford full-time customer service but need immediate response capability.",
    viabilityScore: 88,
    profitPotential: "$5K-20K/mo",
    timeToLaunch: "3-5 days",
    startupCost: "$50-150",
    experienceNeeded: "Beginner",
    urgencyLevel: "high" as const,
    tags: ["Local Business", "AI", "B2B", "SaaS"],
  },
  {
    id: "3",
    name: "Niche Newsletter Acquisition Platform",
    description: "Build or acquire small newsletters in profitable niches, monetize through sponsors and premium content. Roll up multiple properties.",
    problem: "Advertisers struggle to reach targeted, engaged audiences. Newsletter creators lack monetization expertise and infrastructure.",
    viabilityScore: 85,
    profitPotential: "$10K-100K/mo",
    timeToLaunch: "2-4 weeks",
    startupCost: "$500-2000",
    experienceNeeded: "Intermediate",
    urgencyLevel: "high" as const,
    tags: ["Media", "Acquisition", "Passive Income", "B2B"],
  },
  {
    id: "4",
    name: "AI-Powered Resume Optimization SaaS",
    description: "Help job seekers beat ATS systems with AI-optimized resumes tailored to specific job postings. Include interview prep and job matching.",
    problem: "75% of resumes are rejected by ATS before human review. Job seekers apply to 100s of jobs with generic resumes that don't convert.",
    viabilityScore: 87,
    profitPotential: "$20K-80K/mo",
    timeToLaunch: "3-4 weeks",
    startupCost: "$200-500",
    experienceNeeded: "Intermediate",
    urgencyLevel: "critical" as const,
    tags: ["SaaS", "AI", "HR Tech", "B2C"],
  },
  {
    id: "5",
    name: "Elderly Tech Support Subscription",
    description: "White-glove tech support for seniors. Remote and in-home help with devices, scam protection, and digital safety. Family dashboard included.",
    problem: "Seniors are top targets for tech scams ($3B+ lost yearly). Families worry about parents' digital safety but lack time for ongoing support.",
    viabilityScore: 83,
    profitPotential: "$8K-30K/mo",
    timeToLaunch: "1-2 weeks",
    startupCost: "$0-200",
    experienceNeeded: "Beginner",
    urgencyLevel: "high" as const,
    tags: ["Service", "Subscription", "Senior Care", "B2C"],
  },
  {
    id: "6",
    name: "E-commerce Returns Processing",
    description: "Handle product returns for small e-commerce brands. Inspect, repackage, resell or liquidate. Take percentage of recovered value.",
    problem: "Returns cost e-commerce 15-20% of revenue. Small brands lack infrastructure to process, resell, or recoup return value efficiently.",
    viabilityScore: 79,
    profitPotential: "$10K-40K/mo",
    timeToLaunch: "2-3 weeks",
    startupCost: "$500-1500",
    experienceNeeded: "Intermediate",
    urgencyLevel: "medium" as const,
    tags: ["E-commerce", "Operations", "B2B", "Service"],
  },
];

type AppStep = "hero" | "profile-generate" | "profile-validate" | "validator" | "loading" | "results";

interface UserProfile {
  expertise: string;
  interests: string;
  budget: string;
  skills: string;
}

const Index = () => {
  const [step, setStep] = useState<AppStep>("hero");
  const [mode, setMode] = useState<"generate" | "validate">("generate");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ideas, setIdeas] = useState(sampleIdeas);

  const handleGenerateClick = () => {
    setMode("generate");
    setStep("profile-generate");
  };

  const handleValidateClick = () => {
    setMode("validate");
    setStep("profile-validate");
  };

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
    if (mode === "generate") {
      setStep("loading");
      // Simulate API call
      setTimeout(() => {
        setIdeas(sampleIdeas);
        setStep("results");
      }, 3000);
    } else {
      setStep("validator");
    }
  };

  const handleIdeaValidate = (idea: string) => {
    setStep("loading");
    // Simulate validation
    setTimeout(() => {
      // Would normally return validation results
      // For now, show generated alternatives
      setIdeas(sampleIdeas.slice(0, 3));
      setStep("results");
    }, 3000);
  };

  const handleSelectIdea = (idea: typeof sampleIdeas[0]) => {
    // Future: navigate to business builder
    console.log("Selected idea:", idea);
  };

  const handleRegenerate = () => {
    setStep("loading");
    setTimeout(() => {
      // Shuffle ideas for demo
      setIdeas([...sampleIdeas].sort(() => Math.random() - 0.5));
      setStep("results");
    }, 2500);
  };

  const handleBack = () => {
    switch (step) {
      case "profile-generate":
      case "profile-validate":
        setStep("hero");
        break;
      case "validator":
        setStep("profile-validate");
        break;
      case "results":
        if (mode === "generate") {
          setStep("profile-generate");
        } else {
          setStep("validator");
        }
        break;
      default:
        setStep("hero");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {step === "hero" && (
        <Hero onGenerateClick={handleGenerateClick} onValidateClick={handleValidateClick} />
      )}

      {(step === "profile-generate" || step === "profile-validate") && (
        <UserProfileForm
          mode={mode}
          onSubmit={handleProfileSubmit}
          onBack={handleBack}
        />
      )}

      {step === "validator" && userProfile && (
        <IdeaValidator
          userProfile={userProfile}
          onValidate={handleIdeaValidate}
          onBack={handleBack}
        />
      )}

      {step === "loading" && (
        <LoadingState
          message={mode === "generate" ? "Discovering Your Perfect Business..." : "Analyzing Your Idea..."}
        />
      )}

      {step === "results" && (
        <GeneratedIdeas
          ideas={ideas}
          onSelectIdea={handleSelectIdea}
          onRegenerate={handleRegenerate}
          onBack={handleBack}
        />
      )}
    </main>
  );
};

export default Index;
