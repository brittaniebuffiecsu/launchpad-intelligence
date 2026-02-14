import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Rocket, Swords, Megaphone, Loader2, CheckCircle, Target, TrendingUp, Calendar, DollarSign, AlertTriangle, Sparkles, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface UserProfile {
  expertise: string;
  interests: string;
  budget: string;
  skills: string;
}

interface BuildBusinessViewProps {
  idea: BusinessIdea;
  profile: UserProfile;
  onBack: () => void;
}

const BuildBusinessView = ({ idea, profile, onBack }: BuildBusinessViewProps) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [businessPlan, setBusinessPlan] = useState<any>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null);
  const [marketingCopy, setMarketingCopy] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const runAction = async (action: string) => {
    setLoading(action);
    setActiveAction(action);
    try {
      const { data, error } = await supabase.functions.invoke("build-business", {
        body: { idea, profile, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      switch (action) {
        case "full_plan": setBusinessPlan(data.result); break;
        case "competitor_analysis": setCompetitorAnalysis(data.result); break;
        case "marketing_copy": setMarketingCopy(data.result); break;
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate. Try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
  };

  const actions = [
    { key: "full_plan", icon: Rocket, label: "Full Business Plan", desc: "Brand, timeline, financials & strategy", done: !!businessPlan },
    { key: "competitor_analysis", icon: Swords, label: "Competitor Analysis", desc: "Market gaps, threats & positioning", done: !!competitorAnalysis },
    { key: "marketing_copy", icon: Megaphone, label: "Marketing Copy", desc: "Headlines, emails, social & ads", done: !!marketingCopy },
  ];

  return (
    <section className="relative min-h-screen py-12 px-4">
      <div className="absolute inset-0 bg-hero-glow opacity-20" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to ideas
        </button>

        {/* Idea header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{idea.name}</h1>
              <p className="text-muted-foreground mb-3">{idea.description}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1 text-success"><DollarSign className="w-3.5 h-3.5" />{idea.profitPotential}</span>
                <span className="flex items-center gap-1 text-primary"><Calendar className="w-3.5 h-3.5" />{idea.timeToLaunch}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Target className="w-3.5 h-3.5" />{idea.startupCost}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {actions.map((a) => (
            <motion.button
              key={a.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => a.done ? setActiveAction(a.key) : runAction(a.key)}
              disabled={loading === a.key}
              className={`glass-card p-5 text-left transition-all hover:translate-y-[-2px] ${activeAction === a.key ? "border-primary/50" : ""}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {loading === a.key ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : a.done ? <CheckCircle className="w-5 h-5 text-success" /> : <a.icon className="w-5 h-5 text-primary" />}
                <span className="font-display font-semibold text-foreground">{a.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Results */}
        {activeAction === "full_plan" && businessPlan && <BusinessPlanView plan={businessPlan} onCopy={copyToClipboard} />}
        {activeAction === "competitor_analysis" && competitorAnalysis && <CompetitorView data={competitorAnalysis} onCopy={copyToClipboard} />}
        {activeAction === "marketing_copy" && marketingCopy && <MarketingView data={marketingCopy} onCopy={copyToClipboard} />}
      </div>
    </section>
  );
};

const BusinessPlanView = ({ plan, onCopy }: { plan: any; onCopy: (t: string) => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <Card className="glass-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> {plan.businessName}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium text-primary italic">"{plan.tagline}"</p>
        <div><h4 className="text-sm font-semibold text-muted-foreground mb-1">Elevator Pitch</h4><p className="text-foreground">{plan.elevatorPitch}</p></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><h4 className="text-sm font-semibold text-muted-foreground mb-1">Target Audience</h4><p className="text-sm text-foreground">{plan.targetAudience}</p></div>
          <div><h4 className="text-sm font-semibold text-muted-foreground mb-1">Revenue Model</h4><p className="text-sm text-foreground">{plan.revenueModel}</p></div>
        </div>
        <div><h4 className="text-sm font-semibold text-muted-foreground mb-1">Competitive Advantage</h4><p className="text-sm text-foreground">{plan.competitiveAdvantage}</p></div>
      </CardContent>
    </Card>

    <Tabs defaultValue="timeline">
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="marketing">Marketing</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="risks">Risks</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">
        <Card className="glass-card">
          <CardContent className="pt-6 space-y-4">
            {plan.launchTimeline?.map((phase: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 text-xs font-bold text-primary flex-shrink-0">{phase.week}</div>
                <div><h4 className="font-semibold text-foreground text-sm">{phase.title}</h4>
                  <ul className="mt-1 space-y-1">{phase.tasks?.map((t: string, j: number) => <li key={j} className="text-sm text-muted-foreground flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />{t}</li>)}</ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="marketing">
        <Card className="glass-card">
          <CardContent className="pt-6 space-y-4">
            <div><h4 className="text-sm font-semibold text-muted-foreground mb-2">Channels</h4><div className="flex flex-wrap gap-2">{plan.marketingStrategy?.channels?.map((c: string, i: number) => <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{c}</span>)}</div></div>
            <div><h4 className="text-sm font-semibold text-muted-foreground mb-2">Launch Tactics</h4><ul className="space-y-1">{plan.marketingStrategy?.launchTactics?.map((t: string, i: number) => <li key={i} className="text-sm text-foreground">• {t}</li>)}</ul></div>
            <div><h4 className="text-sm font-semibold text-muted-foreground mb-1">Budget Allocation</h4><p className="text-sm text-foreground">{plan.marketingStrategy?.budgetAllocation}</p></div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="financial">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[{ label: "Month 1", val: plan.financialProjection?.month1 }, { label: "Month 3", val: plan.financialProjection?.month3 }, { label: "Month 6", val: plan.financialProjection?.month6 }, { label: "Month 12", val: plan.financialProjection?.month12 }].map((m, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                  <div className="text-sm font-bold text-foreground">{m.val}</div>
                </div>
              ))}
            </div>
            <div className="mb-4"><h4 className="text-sm font-semibold text-muted-foreground mb-1">Break-even</h4><p className="text-sm text-foreground">{plan.financialProjection?.breakEvenTimeline}</p></div>
            <div><h4 className="text-sm font-semibold text-muted-foreground mb-2">Key Expenses</h4><ul className="space-y-1">{plan.financialProjection?.keyExpenses?.map((e: string, i: number) => <li key={i} className="text-sm text-foreground">• {e}</li>)}</ul></div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="risks">
        <Card className="glass-card">
          <CardContent className="pt-6 space-y-3">
            {plan.risks?.map((r: string, i: number) => <div key={i} className="flex items-start gap-3"><AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" /><p className="text-sm text-foreground">{r}</p></div>)}
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2"><Rocket className="w-4 h-4" /> Do These Today</h4>
              <ul className="space-y-2">{plan.nextSteps?.map((s: string, i: number) => <li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>{s}</li>)}</ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    <Button variant="outline" onClick={() => onCopy(JSON.stringify(plan, null, 2))} className="w-full"><Copy className="w-4 h-4 mr-2" /> Copy Full Plan</Button>
  </motion.div>
);

const CompetitorView = ({ data, onCopy }: { data: any; onCopy: (t: string) => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <Card className="glass-card">
      <CardContent className="pt-6 space-y-4">
        <div><h4 className="text-sm font-semibold text-muted-foreground mb-1">Market Overview</h4><p className="text-foreground text-sm">{data.marketOverview}</p></div>
        <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Threat Level:</span><span className={`px-3 py-1 rounded-full text-xs font-bold ${data.threatLevel === "High" ? "bg-destructive/20 text-destructive" : data.threatLevel === "Medium" ? "bg-primary/20 text-primary" : "bg-success/20 text-success"}`}>{data.threatLevel}</span></div>
      </CardContent>
    </Card>
    <div className="grid md:grid-cols-2 gap-4">
      {data.directCompetitors?.map((c: any, i: number) => (
        <Card key={i} className="glass-card">
          <CardContent className="pt-6">
            <h4 className="font-display font-bold text-foreground mb-3">{c.name}</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-success font-medium">Strengths: </span><span className="text-muted-foreground">{c.strengths}</span></p>
              <p><span className="text-destructive font-medium">Weaknesses: </span><span className="text-muted-foreground">{c.weaknesses}</span></p>
              <p><span className="text-primary font-medium">Pricing: </span><span className="text-muted-foreground">{c.pricing}</span></p>
              <p><span className="text-muted-foreground">Market Share: {c.marketShare}</span></p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="glass-card">
      <CardContent className="pt-6 space-y-4">
        <div><h4 className="text-sm font-semibold text-primary mb-2">Market Gaps</h4><ul className="space-y-1">{data.marketGaps?.map((g: string, i: number) => <li key={i} className="text-sm text-foreground">• {g}</li>)}</ul></div>
        <div><h4 className="text-sm font-semibold text-primary mb-2">Your Differentiators</h4><ul className="space-y-1">{data.differentiators?.map((d: string, i: number) => <li key={i} className="text-sm text-foreground">• {d}</li>)}</ul></div>
        <div><h4 className="text-sm font-semibold text-muted-foreground mb-1">Positioning Strategy</h4><p className="text-sm text-foreground">{data.positioningStrategy}</p></div>
      </CardContent>
    </Card>
    <Button variant="outline" onClick={() => onCopy(JSON.stringify(data, null, 2))} className="w-full"><Copy className="w-4 h-4 mr-2" /> Copy Analysis</Button>
  </motion.div>
);

const MarketingView = ({ data, onCopy }: { data: any; onCopy: (t: string) => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <Card className="glass-card">
      <CardHeader><CardTitle className="text-lg">Headlines</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {data.headlines?.map((h: string, i: number) => <p key={i} className="text-foreground font-medium p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => onCopy(h)}>{h}</p>)}
      </CardContent>
    </Card>

    <Card className="glass-card">
      <CardHeader><CardTitle className="text-lg">Landing Page Copy</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-display text-xl font-bold text-foreground mb-1">{data.landingPageCopy?.heroHeadline}</h3>
          <p className="text-muted-foreground">{data.landingPageCopy?.heroSubheadline}</p>
        </div>
        <div className="space-y-2">{data.landingPageCopy?.features?.map((f: string, i: number) => <p key={i} className="text-sm text-foreground flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />{f}</p>)}</div>
        <p className="text-sm"><span className="font-semibold text-primary">CTA: </span>{data.landingPageCopy?.cta}</p>
      </CardContent>
    </Card>

    <Tabs defaultValue="social">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="social">Social Posts</TabsTrigger>
        <TabsTrigger value="email">Emails</TabsTrigger>
        <TabsTrigger value="ads">Ad Copy</TabsTrigger>
      </TabsList>
      <TabsContent value="social">
        <Card className="glass-card"><CardContent className="pt-6 space-y-3">
          {data.socialPosts?.map((p: string, i: number) => <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm text-foreground cursor-pointer hover:bg-muted" onClick={() => onCopy(p)}>{p}</div>)}
        </CardContent></Card>
      </TabsContent>
      <TabsContent value="email">
        <Card className="glass-card"><CardContent className="pt-6 space-y-4">
          {data.emailSequence?.map((e: any, i: number) => (
            <div key={i} className="p-4 rounded-lg border border-border/50 space-y-2 cursor-pointer hover:border-primary/30" onClick={() => onCopy(`Subject: ${e.subject}\n\n${e.body}`)}>
              <div className="font-semibold text-foreground text-sm">Subject: {e.subject}</div>
              <div className="text-xs text-muted-foreground">Preview: {e.preview}</div>
              <div className="text-sm text-foreground whitespace-pre-line">{e.body}</div>
            </div>
          ))}
        </CardContent></Card>
      </TabsContent>
      <TabsContent value="ads">
        <Card className="glass-card"><CardContent className="pt-6 space-y-3">
          {data.adCopy?.map((a: string, i: number) => <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm text-foreground cursor-pointer hover:bg-muted" onClick={() => onCopy(a)}>{a}</div>)}
        </CardContent></Card>
      </TabsContent>
    </Tabs>
    <Button variant="outline" onClick={() => onCopy(JSON.stringify(data, null, 2))} className="w-full"><Copy className="w-4 h-4 mr-2" /> Copy All Copy</Button>
  </motion.div>
);

export default BuildBusinessView;
