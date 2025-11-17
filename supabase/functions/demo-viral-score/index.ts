import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { corsHeaders, handleCorsPreflightRequest } from "../_shared/corsHeaders.ts";
import { createErrorResponse, createSuccessResponse } from "../_shared/errorHandler.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // Rate limiting check (10 requests per minute per IP)
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    const rateLimitResult = checkRateLimit({
      identifier: `demo-viral-${clientIp}`,
      maxRequests: 10,
      windowMs: 60 * 1000 // 1 minute
    });

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          } 
        }
      );
    }

    const { idea } = await req.json();
    
    // Enhanced input validation
    if (!idea || typeof idea !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input: idea must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedIdea = idea.trim();
    if (trimmedIdea.length < 10 || trimmedIdea.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Idea must be between 10 and 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pseudo-random scoring based on string hash for consistent results
    const hash = trimmedIdea.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    const baseScore = Math.abs(hash % 40) + 50; // Range: 50-90
    
    // Boost score based on viral indicators
    let score = baseScore;
    const lowerIdea = trimmedIdea.toLowerCase();
    
    if (lowerIdea.includes('pov') || lowerIdea.includes('storytime')) score += 5;
    if (lowerIdea.match(/\?|!|😱|🚩|💔/)) score += 3;
    if (lowerIdea.includes('dating') || lowerIdea.includes('relationship')) score += 4;
    if (lowerIdea.includes('horror') || lowerIdea.includes('scary')) score += 4;
    if (lowerIdea.includes('toxic') || lowerIdea.includes('red flag')) score += 3;
    if (trimmedIdea.length > 100) score += 2; // More detail = better
    
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

    return createSuccessResponse({ 
      score, 
      summary, 
      tips: tips.slice(0, 3) 
    });

  } catch (error) {
    return createErrorResponse(error.message || 'Failed to analyze script idea');
  }
});
