import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Hero from "../components/Hero";
import UserProfileForm from "../components/UserProfileForm";
import IdeaValidator from "../components/IdeaValidator";
import GeneratedIdeas from "../components/GeneratedIdeas";
import LoadingState from "../components/LoadingState";

type AppStep = "hero" | "profile-generate" | "profile-validate" | "validator" | "loading" | "results";

interface UserProfile {
  expertise: string;
  interests: string;
  budget: string;
  skills: string;
}

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

const Index = () => {
  const [step, setStep] = useState<AppStep>("hero");
  const [mode, setMode] = useState<"generate" | "validate">("generate");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [userIdea, setUserIdea] = useState("");
  const { toast } = useToast();

  const generateIdeas = async (profile: UserProfile, ideaMode: "generate" | "validate", idea?: string) => {
    setStep("loading");
    try {
      const { data, error } = await supabase.functions.invoke("generate-ideas", {
        body: { profile, mode: ideaMode, userIdea: idea || "" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setIdeas(data.ideas);
      setStep("results");
    } catch (e: any) {
      console.error("AI generation error:", e);
      toast({
        title: "Generation Failed",
        description: e.message || "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
      setStep(ideaMode === "generate" ? "profile-generate" : "validator");
    }
  };

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
      generateIdeas(profile, "generate");
    } else {
      setStep("validator");
    }
  };

  const handleIdeaValidate = (idea: string) => {
    setUserIdea(idea);
    if (userProfile) {
      generateIdeas(userProfile, "validate", idea);
    }
  };

  const handleSelectIdea = (idea: BusinessIdea) => {
    console.log("Selected idea:", idea);
  };

  const handleRegenerate = () => {
    if (userProfile) {
      generateIdeas(userProfile, mode, mode === "validate" ? userIdea : undefined);
    }
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
