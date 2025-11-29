/**
 * Shared AI Client for Edge Functions
 * Centralized access to Lovable AI Gateway
 */

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

export const AI_MODELS = {
  imageGeneration: {
    default: 'google/gemini-3-pro-image-preview',
    fast: 'google/gemini-2.5-flash-image',
  },
  chat: {
    default: 'google/gemini-2.5-flash',
    pro: 'google/gemini-2.5-pro',
    lite: 'google/gemini-2.5-flash-lite',
  },
} as const;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface ImageOptions {
  model?: string;
  prompt: string;
}

/**
 * Generate image using Lovable AI Gateway
 */
export async function generateImage(
  options: ImageOptions
): Promise<{ imageUrl: string; error?: string }> {
  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { prompt, model = AI_MODELS.imageGeneration.default } = options;

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image URL in AI response');
    }

    return { imageUrl };
  } catch (error: any) {
    console.error('Image generation error:', error);
    return {
      imageUrl: '',
      error: error.message || 'Failed to generate image',
    };
  }
}

/**
 * Chat with AI using Lovable AI Gateway
 */
export async function chat(
  messages: Message[],
  options: ChatOptions = {}
): Promise<{ response: string; error?: string }> {
  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { model = AI_MODELS.chat.default, maxTokens, temperature } = options;

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    return { response: content };
  } catch (error: any) {
    console.error('Chat error:', error);
    return {
      response: '',
      error: error.message || 'Failed to get AI response',
    };
  }
}
