import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { step, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating suggestions for step ${step}`, context);

    let systemPrompt = "";
    let userPrompt = "";

    // Generate prompts based on the step
    switch (step) {
      case 1: // Title suggestions
        systemPrompt = "You are a viral content expert specializing in TikTok and short-form drama series. Generate catchy, attention-grabbing series titles that would stop viewers mid-scroll.";
        userPrompt = `Generate 5 viral series titles for a ${context.niche} drama series. ${context.remixTitle ? `The original title is "${context.remixTitle}". Create variations that keep the viral essence but feel fresh.` : 'Create titles that are emotional, intriguing, and use popular formats like "The [Adjective] [Noun]" or "[Situation] [Drama Type]".'}\n\nReturn ONLY a JSON array of 5 title strings, nothing else. Example: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]`;
        break;

      case 2: // Logline suggestions
        systemPrompt = "You are a Hollywood script consultant who creates compelling one-sentence loglines that hook audiences instantly.";
        userPrompt = `Generate 5 viral loglines for a series titled "${context.title}" in the ${context.niche} niche. Each logline should be one sentence that:\n- Establishes the core conflict or mystery\n- Creates emotional investment\n- Makes viewers NEED to know what happens next\n- Is 15-25 words long\n\n${context.remixLogline ? `The original logline is: "${context.remixLogline}". Create variations that maintain the hook but offer different angles.` : ''}\n\nReturn ONLY a JSON array of 5 logline strings, nothing else. Example: ["Logline 1", "Logline 2", "Logline 3", "Logline 4", "Logline 5"]`;
        break;

      case 3: // Episode count & structure suggestions
        systemPrompt = "You are a content strategist who understands audience retention and serialized storytelling.";
        userPrompt = `For a ${context.niche} series titled "${context.title}" with the logline "${context.logline}", suggest 5 different episode structures.\n\nFor each structure, provide:\n- Episode count (between 5-15)\n- Brief reasoning (why this count works for this story)\n\nReturn ONLY a JSON array of 5 objects with this format:\n[{"episodes": 7, "reason": "Perfect for a week-long mystery arc"}, ...]\n\nConsider:\n- ${context.niche} stories typically work best with certain lengths\n- Cliffhanger placement\n- Audience attention span\n- Story complexity`;
        break;

      default:
        throw new Error("Invalid step");
    }

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8, // Higher creativity for suggestions
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let suggestions;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                       content.match(/(\[[\s\S]*?\])/);
      
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[1]);
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI suggestions");
    }

    console.log(`Generated ${suggestions.length} suggestions for step ${step}`);

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in generate-series-suggestions:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate suggestions" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
