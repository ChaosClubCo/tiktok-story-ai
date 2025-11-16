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
    const { idea } = await req.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Please provide a script idea with at least 10 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pseudo-random scoring based on string hash for consistent results
    const hash = idea.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    const baseScore = Math.abs(hash % 40) + 50; // Range: 50-90
    
    // Boost score based on viral indicators
    let score = baseScore;
    const lowerIdea = idea.toLowerCase();
    
    if (lowerIdea.includes('pov') || lowerIdea.includes('storytime')) score += 5;
    if (lowerIdea.match(/\?|!|😱|🚩|💔/)) score += 3;
    if (lowerIdea.includes('dating') || lowerIdea.includes('relationship')) score += 4;
    if (lowerIdea.includes('horror') || lowerIdea.includes('scary')) score += 4;
    if (lowerIdea.includes('toxic') || lowerIdea.includes('red flag')) score += 3;
    if (idea.length > 100) score += 2; // More detail = better
    
    score = Math.min(Math.round(score), 98); // Cap at 98

    // Generate summary based on score range
    let summary = '';
    if (score >= 85) {
      summary = 'Exceptional viral potential with strong emotional hook';
    } else if (score >= 70) {
      summary = 'Strong viral potential with clear conflict';
    } else if (score >= 60) {
      summary = 'Good foundation with room for enhancement';
    } else {
      summary = 'Solid idea that needs stronger hooks';
    }

    // Generate improvement tips based on content
    const tips = [];
    
    if (!lowerIdea.includes('pov')) {
      tips.push('Add a POV angle to increase relatability');
    }
    if (!idea.match(/[!?]/)) {
      tips.push('Include emotional punctuation (! or ?) to heighten drama');
    }
    if (idea.length < 50) {
      tips.push('Expand on the conflict or twist to add more intrigue');
    }
    if (!lowerIdea.match(/dating|relationship|horror|scary|toxic|drama/)) {
      tips.push('Consider adding a popular niche angle (dating, horror, etc.)');
    }
    if (tips.length < 3) {
      tips.push('Build in a cliffhanger moment for series potential');
    }
    if (tips.length < 3) {
      tips.push('Focus on universal emotions (betrayal, fear, revenge)');
    }

    return new Response(
      JSON.stringify({
        score,
        summary,
        tips: tips.slice(0, 3)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in demo-viral-score:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze script idea' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
