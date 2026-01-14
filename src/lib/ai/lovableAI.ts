/**
 * Centralized Lovable AI Client
 * Unified interface for all AI operations through Lovable AI Gateway
 */

import { supabase } from '@/integrations/supabase/client';
import { AI_MODELS, MODEL_LIMITS } from './modelConfig';

export interface ImageGenerationOptions {
  model?: string;
  prompt: string;
  aspectRatio?: string;
}

export interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generate an image using Lovable AI Gateway
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<{ imageUrl: string; error?: string }> {
  try {
    const { prompt, model = AI_MODELS.imageGeneration.default, aspectRatio } = options;

    // Validate prompt length
    if (prompt.length > MODEL_LIMITS.imageGeneration.maxPromptLength) {
      throw new Error(`Prompt exceeds maximum length of ${MODEL_LIMITS.imageGeneration.maxPromptLength} characters`);
    }

    const enhancedPrompt = aspectRatio 
      ? `${aspectRatio} aspect ratio image: ${prompt}. Ultra high resolution.`
      : `${prompt}. Ultra high resolution.`;

    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: {
        type: 'image',
        model,
        prompt: enhancedPrompt,
      },
    });

    if (error) throw error;
    if (!data?.imageUrl) throw new Error('No image URL returned from AI');

    return { imageUrl: data.imageUrl };
  } catch (error: any) {
    console.error('Image generation error:', error);
    return { 
      imageUrl: '', 
      error: error.message || 'Failed to generate image' 
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
    const { model = AI_MODELS.chat.default, maxTokens, temperature } = options;

    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: {
        type: 'chat',
        model,
        messages,
        maxTokens,
        temperature,
      },
    });

    if (error) throw error;
    if (!data?.response) throw new Error('No response from AI');

    return { response: data.response };
  } catch (error: any) {
    console.error('Chat error:', error);
    return { 
      response: '', 
      error: error.message || 'Failed to get AI response' 
    };
  }
}

/**
 * Stream chat responses from AI
 */
export async function streamChat(
  messages: Message[],
  onDelta: (delta: string) => void,
  options: ChatOptions = {}
): Promise<{ error?: string }> {
  try {
    const { model = AI_MODELS.chat.default } = options;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          type: 'chat-stream',
          model,
          messages,
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error('Failed to start stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    return {};
  } catch (error: any) {
    console.error('Stream chat error:', error);
    return { error: error.message || 'Failed to stream chat' };
  }
}

/**
 * Generate audio using OpenAI TTS
 */
export async function generateAudio(
  text: string,
  voice: string = 'alloy'
): Promise<{ audioUrl: string; error?: string }> {
  try {
    // Validate text length
    if (text.length > MODEL_LIMITS.audio.maxTextLength) {
      throw new Error(`Text exceeds maximum length of ${MODEL_LIMITS.audio.maxTextLength} characters`);
    }

    const { data, error } = await supabase.functions.invoke('generate-scene-audio', {
      body: { text, voice },
    });

    if (error) throw error;
    if (!data?.audioUrl) throw new Error('No audio URL returned');

    return { audioUrl: data.audioUrl };
  } catch (error: any) {
    console.error('Audio generation error:', error);
    return { 
      audioUrl: '', 
      error: error.message || 'Failed to generate audio' 
    };
  }
}
