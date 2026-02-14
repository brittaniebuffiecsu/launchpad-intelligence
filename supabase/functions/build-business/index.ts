import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { idea, profile, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;
    let toolDef: any;

    switch (action) {
      case "full_plan":
        systemPrompt = `You are a world-class business strategist and startup advisor. Generate comprehensive, actionable business plans. You MUST respond by calling the provided function tool.`;
        userPrompt = `Create a complete business launch plan for:
Business: "${idea.name}"
Description: ${idea.description}
Problem it solves: ${idea.problem}
Startup Cost: ${idea.startupCost}
User Experience: ${profile.expertise}
User Budget: ${profile.budget}
User Skills: ${profile.skills}

Generate a detailed plan with brand identity, marketing strategy, financial projections, launch timeline, and step-by-step actions.`;
        toolDef = {
          name: "return_business_plan",
          description: "Return a comprehensive business plan",
          parameters: {
            type: "object",
            properties: {
              businessName: { type: "string", description: "Recommended business name" },
              tagline: { type: "string", description: "Catchy tagline/slogan" },
              elevatorPitch: { type: "string", description: "30-second elevator pitch" },
              targetAudience: { type: "string", description: "Detailed target audience description" },
              revenueModel: { type: "string", description: "How the business makes money" },
              competitiveAdvantage: { type: "string", description: "What makes this business unique" },
              brandIdentity: {
                type: "object",
                properties: {
                  tone: { type: "string" },
                  colors: { type: "array", items: { type: "string" } },
                  fonts: { type: "array", items: { type: "string" } },
                  personality: { type: "string" },
                },
                required: ["tone", "colors", "fonts", "personality"],
              },
              launchTimeline: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    week: { type: "string" },
                    title: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                  },
                  required: ["week", "title", "tasks"],
                },
              },
              marketingStrategy: {
                type: "object",
                properties: {
                  channels: { type: "array", items: { type: "string" } },
                  contentIdeas: { type: "array", items: { type: "string" } },
                  launchTactics: { type: "array", items: { type: "string" } },
                  budgetAllocation: { type: "string" },
                },
                required: ["channels", "contentIdeas", "launchTactics", "budgetAllocation"],
              },
              financialProjection: {
                type: "object",
                properties: {
                  month1: { type: "string" },
                  month3: { type: "string" },
                  month6: { type: "string" },
                  month12: { type: "string" },
                  breakEvenTimeline: { type: "string" },
                  keyExpenses: { type: "array", items: { type: "string" } },
                },
                required: ["month1", "month3", "month6", "month12", "breakEvenTimeline", "keyExpenses"],
              },
              risks: { type: "array", items: { type: "string" }, description: "Top 5 risks and mitigations" },
              nextSteps: { type: "array", items: { type: "string" }, description: "Immediate next 5 actions to take today" },
            },
            required: ["businessName", "tagline", "elevatorPitch", "targetAudience", "revenueModel", "competitiveAdvantage", "brandIdentity", "launchTimeline", "marketingStrategy", "financialProjection", "risks", "nextSteps"],
            additionalProperties: false,
          },
        };
        break;

      case "competitor_analysis":
        systemPrompt = `You are a competitive intelligence analyst. Analyze the competitive landscape thoroughly. You MUST respond by calling the provided function tool.`;
        userPrompt = `Analyze the competitive landscape for: "${idea.name}" - ${idea.description}. Industry focus: ${profile.interests}. Identify direct competitors, indirect competitors, market gaps, and positioning strategies.`;
        toolDef = {
          name: "return_competitor_analysis",
          description: "Return competitive analysis",
          parameters: {
            type: "object",
            properties: {
              marketOverview: { type: "string" },
              directCompetitors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    strengths: { type: "string" },
                    weaknesses: { type: "string" },
                    pricing: { type: "string" },
                    marketShare: { type: "string" },
                  },
                  required: ["name", "strengths", "weaknesses", "pricing", "marketShare"],
                },
              },
              marketGaps: { type: "array", items: { type: "string" } },
              positioningStrategy: { type: "string" },
              differentiators: { type: "array", items: { type: "string" } },
              threatLevel: { type: "string", description: "Low, Medium, or High" },
            },
            required: ["marketOverview", "directCompetitors", "marketGaps", "positioningStrategy", "differentiators", "threatLevel"],
            additionalProperties: false,
          },
        };
        break;

      case "marketing_copy":
        systemPrompt = `You are an expert copywriter and marketing strategist. Generate compelling marketing materials. You MUST respond by calling the provided function tool.`;
        userPrompt = `Generate marketing copy for: "${idea.name}" - ${idea.description}. Target audience based on: ${profile.interests}. Budget: ${profile.budget}.`;
        toolDef = {
          name: "return_marketing_copy",
          description: "Return marketing copy",
          parameters: {
            type: "object",
            properties: {
              headlines: { type: "array", items: { type: "string" }, description: "5 attention-grabbing headlines" },
              emailSequence: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    preview: { type: "string" },
                    body: { type: "string" },
                  },
                  required: ["subject", "preview", "body"],
                },
              },
              socialPosts: { type: "array", items: { type: "string" }, description: "5 social media posts" },
              landingPageCopy: {
                type: "object",
                properties: {
                  heroHeadline: { type: "string" },
                  heroSubheadline: { type: "string" },
                  features: { type: "array", items: { type: "string" } },
                  cta: { type: "string" },
                  testimonialTemplates: { type: "array", items: { type: "string" } },
                },
                required: ["heroHeadline", "heroSubheadline", "features", "cta", "testimonialTemplates"],
              },
              adCopy: { type: "array", items: { type: "string" }, description: "3 ad copy variants" },
            },
            required: ["headlines", "emailSequence", "socialPosts", "landingPageCopy", "adCopy"],
            additionalProperties: false,
          },
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "function", function: toolDef }],
        tool_choice: { type: "function", function: { name: toolDef.name } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ result, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("build-business error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
