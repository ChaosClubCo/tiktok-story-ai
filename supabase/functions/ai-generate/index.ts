/**
 * Unified AI Generation Edge Function
 * Handles all AI generation types through Lovable AI Gateway
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/corsHeaders.ts';
import { createClient } from '../_shared/authHelpers.ts';
import { generateImage, chat, AI_MODELS } from '../_shared/aiClient.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, model, prompt, messages, maxTokens, temperature } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    let result;

    switch (type) {
      case 'image': {
        if (!prompt) {
          throw new Error('Missing prompt for image generation');
        }
        result = await generateImage({ prompt, model });
        if (result.error) {
          throw new Error(result.error);
        }
        return new Response(
          JSON.stringify({ imageUrl: result.imageUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'chat': {
        if (!messages || !Array.isArray(messages)) {
          throw new Error('Missing messages for chat');
        }
        result = await chat(messages, { model, maxTokens, temperature });
        if (result.error) {
          throw new Error(result.error);
        }
        return new Response(
          JSON.stringify({ response: result.response }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'chat-stream': {
        // Streaming not implemented in this unified function yet
        // Use dedicated streaming edge functions
        throw new Error('Streaming not supported in this endpoint');
      }

      default:
        throw new Error(`Unknown generation type: ${type}`);
    }
  } catch (error: any) {
    console.error('AI generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes('Unauthorized') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
