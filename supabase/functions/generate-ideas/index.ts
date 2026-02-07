import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, mode, userIdea } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an elite AI business strategist. You analyze market trends, identify underserved niches, and generate highly actionable business ideas.

Your task is to generate business ideas that are:
- "Painkiller" solutions solving urgent, real problems
- Based on current market trends and gaps
- Tailored to the user's experience level, budget, skills, and interests
- Practical and launchable within the stated timeframe

You MUST respond by calling the provided function tool. Do not respond with plain text.`;

    let userPrompt: string;

    if (mode === "validate") {
      userPrompt = `The user wants to validate this business idea: "${userIdea}"

User Profile:
- Experience Level: ${profile.expertise}
- Interests: ${profile.interests}
- Budget: ${profile.budget}
- Skills: ${profile.skills}

Analyze the idea's viability and also suggest 3 improved or related alternatives. Return all ideas (including the validated original) via the tool call.`;
    } else {
      userPrompt = `Generate 6 unique, high-potential business ideas for this user:

User Profile:
- Experience Level: ${profile.expertise}
- Interests & Industries: ${profile.interests}
- Budget: ${profile.budget}
- Skills: ${profile.skills}

Focus on ideas that match their budget and experience. Prioritize urgent market needs and underserved niches. Each idea should be distinct and actionable.`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
          tools: [
            {
              type: "function",
              function: {
                name: "return_business_ideas",
                description:
                  "Return a list of business ideas with detailed analysis.",
                parameters: {
                  type: "object",
                  properties: {
                    ideas: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "Business name/concept",
                          },
                          description: {
                            type: "string",
                            description:
                              "2-3 sentence description of the business model",
                          },
                          problem: {
                            type: "string",
                            description:
                              "The urgent problem this solves with data/stats if possible",
                          },
                          viabilityScore: {
                            type: "number",
                            description:
                              "Score 0-100 based on market demand, competition, and feasibility",
                          },
                          profitPotential: {
                            type: "string",
                            description:
                              "Monthly revenue range e.g. '$5K-20K/mo'",
                          },
                          timeToLaunch: {
                            type: "string",
                            description: "e.g. '1-2 weeks', '3-5 days'",
                          },
                          startupCost: {
                            type: "string",
                            description: "e.g. '$100-300'",
                          },
                          experienceNeeded: {
                            type: "string",
                            description:
                              "Beginner, Intermediate, or Experienced",
                          },
                          urgencyLevel: {
                            type: "string",
                            enum: ["critical", "high", "medium"],
                            description: "How urgent is the market demand",
                          },
                          tags: {
                            type: "array",
                            items: { type: "string" },
                            description: "3-4 relevant category tags",
                          },
                        },
                        required: [
                          "name",
                          "description",
                          "problem",
                          "viabilityScore",
                          "profitPotential",
                          "timeToLaunch",
                          "startupCost",
                          "experienceNeeded",
                          "urgencyLevel",
                          "tags",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["ideas"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_business_ideas" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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

    const parsed = JSON.parse(toolCall.function.arguments);
    const ideas = parsed.ideas.map((idea: any, index: number) => ({
      id: String(index + 1),
      ...idea,
    }));

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ideas error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
