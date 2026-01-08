/**
 * Centralized AI Model Configuration
 * Defines the best available models for each use case
 */

export const AI_MODELS = {
  // Image generation - using the BEST model as default
  imageGeneration: {
    default: 'google/gemini-3-pro-image-preview', // Best quality, next-generation
    fast: 'google/gemini-2.5-flash-image',        // Faster option for quick generations
  },
  
  // Text/chat generation
  chat: {
    default: 'google/gemini-2.5-flash',           // Balanced speed and quality
    pro: 'google/gemini-2.5-pro',                 // Best quality for complex tasks
    lite: 'google/gemini-2.5-flash-lite',         // Fastest for simple tasks
  },
  
  // Audio synthesis
  audio: {
    default: 'tts-1',                              // OpenAI TTS standard
    hd: 'tts-1-hd',                                // High definition audio
  }
} as const;

export type ImageModel = typeof AI_MODELS.imageGeneration[keyof typeof AI_MODELS.imageGeneration];
export type ChatModel = typeof AI_MODELS.chat[keyof typeof AI_MODELS.chat];
export type AudioModel = typeof AI_MODELS.audio[keyof typeof AI_MODELS.audio];

/**
 * Get the default model for a specific use case
 */
export function getDefaultModel(type: 'image' | 'chat' | 'audio'): string {
  switch (type) {
    case 'image':
      return AI_MODELS.imageGeneration.default;
    case 'chat':
      return AI_MODELS.chat.default;
    case 'audio':
      return AI_MODELS.audio.default;
    default:
      throw new Error(`Unknown model type: ${type}`);
  }
}

/**
 * Model capabilities and limitations
 */
export const MODEL_LIMITS = {
  imageGeneration: {
    maxPromptLength: 2000,
    supportedFormats: ['png', 'jpeg'],
    recommendedAspectRatios: ['1:1', '16:9', '9:16', '4:3'],
  },
  chat: {
    maxTokens: 8192,
    contextWindow: 1000000, // Gemini 2.5 has 1M token context
  },
  audio: {
    maxTextLength: 4096,
    supportedVoices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  },
} as const;
