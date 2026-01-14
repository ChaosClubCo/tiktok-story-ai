# GEMINI.md - Gemini AI Integration Guide

> Documentation for Google Gemini AI integration in MiniDrama AI platform.

---

## Overview

MiniDrama AI uses Google Gemini models through the Lovable AI Gateway for image generation and chat capabilities. This document covers the integration architecture, usage patterns, and best practices.

---

## Architecture

### AI Gateway Flow

```
Client Request
    ↓
Lovable AI Gateway (https://ai.gateway.lovable.dev)
    ↓
Model Router
    ├── Gemini 3 Pro Image → Visual Generation
    ├── Gemini Pro → Chat/Analysis
    └── GPT-4o-mini → Script Generation (fallback)
    ↓
Response Processing
    ↓
Client Response
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `lovableAI.ts` | `src/lib/ai/lovableAI.ts` | Unified AI client |
| `modelConfig.ts` | `src/lib/ai/modelConfig.ts` | Model configurations |
| `ai-generate` | `supabase/functions/ai-generate/` | Unified AI endpoint |
| `generate-scene-visuals` | `supabase/functions/generate-scene-visuals/` | Image generation |

---

## Available Models

### Image Generation

| Model | ID | Use Case |
|-------|-----|----------|
| Gemini 3 Pro Image | `gemini-3-pro-image` | High-quality scene visuals |

### Chat/Analysis

| Model | ID | Use Case |
|-------|-----|----------|
| Gemini Pro | `gemini-pro` | Script analysis, content suggestions |
| GPT-4o-mini | `gpt-4o-mini` | Script generation (primary) |

### Configuration

```typescript
// src/lib/ai/modelConfig.ts

export const AI_MODELS = {
  imageGeneration: {
    default: 'gemini-3-pro-image',
    fallback: null
  },
  chat: {
    default: 'gpt-4o-mini',
    fallback: 'gemini-pro'
  },
  audio: {
    default: 'tts-1',
    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
  }
};

export const MODEL_LIMITS = {
  imageGeneration: {
    maxPromptLength: 2000,
    maxRetries: 2
  },
  chat: {
    maxTokens: 4000,
    defaultTemperature: 0.7
  },
  audio: {
    maxTextLength: 4096
  }
};
```

---

## Usage Patterns

### Image Generation

```typescript
import { generateImage } from '@/lib/ai/lovableAI';

// Basic usage
const { imageUrl, error } = await generateImage({
  prompt: 'A dramatic scene in a coffee shop, two people arguing'
});

// With aspect ratio
const { imageUrl, error } = await generateImage({
  prompt: 'Emotional close-up of a person looking shocked',
  aspectRatio: '9:16' // TikTok format
});

// Error handling
if (error) {
  console.error('Image generation failed:', error);
  // Use fallback or retry
}
```

### Chat/Analysis

```typescript
import { chat, streamChat } from '@/lib/ai/lovableAI';

// Standard chat
const { response, error } = await chat([
  { role: 'system', content: 'You are a script analyst.' },
  { role: 'user', content: 'Analyze this script for viral potential...' }
]);

// Streaming chat
await streamChat(
  [{ role: 'user', content: 'Generate a script outline...' }],
  (delta) => {
    // Handle each chunk of the response
    setOutput(prev => prev + delta);
  },
  { model: 'gemini-pro' }
);
```

### Edge Function Usage

```typescript
// supabase/functions/ai-generate/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  const { type, model, prompt, messages } = await req.json();

  switch (type) {
    case 'image':
      return generateImage(model, prompt);
    case 'chat':
      return generateChat(model, messages);
    case 'chat-stream':
      return generateStreamingChat(model, messages);
    default:
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400
      });
  }
});
```

---

## Scene Visual Generation

### Workflow

```
Script Scene
    ↓
Parse Scene Description
    ↓
Enhance Prompt (add visual keywords)
    ↓
Call Gemini 3 Pro Image
    ↓
Store in video_assets
    ↓
Display in Video Editor
```

### Prompt Enhancement

```typescript
// Enhance prompt for better visual generation
function enhanceVisualPrompt(scene: string, aspectRatio: string): string {
  return `${aspectRatio} aspect ratio image: ${scene}.
    Ultra high resolution, cinematic lighting,
    professional photography, dramatic composition.`;
}

// Example
const enhancedPrompt = enhanceVisualPrompt(
  'A young woman discovering a secret letter in an old box',
  '9:16'
);
// Result: "9:16 aspect ratio image: A young woman discovering..."
```

### Scene-to-Visual Mapping

| Scene Type | Visual Style | Keywords |
|------------|--------------|----------|
| Emotional | Close-up, soft lighting | intimate, emotional, dramatic |
| Action | Wide shot, dynamic | energetic, motion, intense |
| Dialogue | Medium shot, neutral | conversation, balanced, natural |
| Reveal | Dramatic lighting | surprise, contrast, focused |

---

## Rate Limiting & Error Handling

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Image generation | 10 | 1 minute |
| Chat completion | 20 | 1 minute |
| Streaming chat | 10 | 1 minute |

### Error Handling

```typescript
export async function generateImage(options: ImageGenerationOptions) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: {
        type: 'image',
        model: options.model || AI_MODELS.imageGeneration.default,
        prompt: options.prompt
      }
    });

    if (error) throw error;
    return { imageUrl: data.imageUrl };

  } catch (error: any) {
    // Handle rate limiting
    if (error.status === 429) {
      return {
        imageUrl: '',
        error: 'Rate limit exceeded. Please wait before trying again.'
      };
    }

    // Handle model errors
    if (error.message?.includes('model')) {
      return {
        imageUrl: '',
        error: 'AI model temporarily unavailable. Please try again.'
      };
    }

    // Generic error
    return {
      imageUrl: '',
      error: 'Failed to generate image. Please try again.'
    };
  }
}
```

### Retry Strategy

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors
      if ((error as any).status < 500) throw error;

      // Wait before retry
      if (i < maxRetries) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}
```

---

## Best Practices

### 1. Prompt Engineering

**Good Prompts:**
```
"A dramatic scene: A young professional in a modern office,
looking shocked at their phone screen. The lighting is
dramatic with soft shadows. 9:16 aspect ratio,
cinematic quality, emotional expression."
```

**Bad Prompts:**
```
"person looking at phone"
```

### 2. Aspect Ratio Selection

| Platform | Aspect Ratio | Usage |
|----------|--------------|-------|
| TikTok | 9:16 | Vertical videos |
| Instagram Reels | 9:16 | Vertical videos |
| YouTube Shorts | 9:16 | Vertical videos |
| Instagram Feed | 1:1 | Square images |
| YouTube | 16:9 | Horizontal videos |

### 3. Scene Consistency

For multi-scene videos, maintain visual consistency:

```typescript
const baseStyle = 'cinematic lighting, professional quality, consistent color grading';

const scenes = [
  `${baseStyle}, scene 1: establishing shot of apartment`,
  `${baseStyle}, scene 2: close-up of character`,
  `${baseStyle}, scene 3: wide shot of confrontation`
];
```

### 4. Content Safety

Gemini has built-in content safety filters. Additional filtering:

```typescript
const PROHIBITED_VISUAL_CONTENT = [
  'violence',
  'explicit',
  'gore',
  'weapons',
  // ... more keywords
];

function validateVisualPrompt(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  return !PROHIBITED_VISUAL_CONTENT.some(keyword =>
    lowerPrompt.includes(keyword)
  );
}
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Empty image URL | Rate limit or API error | Check error message, retry later |
| Low quality images | Poor prompt | Add quality keywords to prompt |
| Wrong aspect ratio | Missing aspect ratio param | Always specify aspect ratio |
| Timeout | Complex prompt or load | Simplify prompt, retry |
| Content blocked | Safety filter triggered | Review and clean prompt |

### Debug Logging

```typescript
// Enable debug mode for AI calls
const DEBUG_AI = import.meta.env.DEV;

if (DEBUG_AI) {
  console.log('[AI Debug] Request:', {
    type: 'image',
    model: options.model,
    promptLength: options.prompt.length
  });
}
```

### Monitoring

Track AI performance metrics:

```typescript
const startTime = performance.now();
const result = await generateImage(options);
const duration = performance.now() - startTime;

// Log to analytics
analytics.track('ai_image_generation', {
  duration,
  success: !result.error,
  model: options.model
});
```

---

## Integration with Video Pipeline

### Full Flow

```typescript
async function generateSceneVisuals(project: VideoProject) {
  const results = [];

  for (const scene of project.scenes) {
    // Generate visual for each scene
    const { imageUrl, error } = await generateImage({
      prompt: scene.visualPrompt,
      aspectRatio: project.aspectRatio
    });

    if (error) {
      console.error(`Scene ${scene.order} failed:`, error);
      continue;
    }

    // Store asset
    await supabase.from('video_assets').insert({
      project_id: project.id,
      scene_id: scene.id,
      type: 'image',
      url: imageUrl
    });

    results.push({ sceneId: scene.id, imageUrl });
  }

  return results;
}
```

### Parallel Generation

For better performance, generate scenes in parallel:

```typescript
async function generateAllSceneVisuals(scenes: Scene[]) {
  const promises = scenes.map(scene =>
    generateImage({
      prompt: scene.visualPrompt,
      aspectRatio: '9:16'
    })
  );

  const results = await Promise.allSettled(promises);

  return results.map((result, index) => ({
    sceneId: scenes[index].id,
    success: result.status === 'fulfilled',
    imageUrl: result.status === 'fulfilled' ? result.value.imageUrl : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
}
```

---

## API Reference

### generateImage

```typescript
function generateImage(options: ImageGenerationOptions): Promise<{
  imageUrl: string;
  error?: string;
}>

interface ImageGenerationOptions {
  prompt: string;           // Required: Scene description
  model?: string;           // Optional: Model ID (default: gemini-3-pro-image)
  aspectRatio?: string;     // Optional: Image aspect ratio
}
```

### chat

```typescript
function chat(
  messages: Message[],
  options?: ChatOptions
): Promise<{
  response: string;
  error?: string;
}>

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;           // Optional: Model ID
  maxTokens?: number;       // Optional: Max response tokens
  temperature?: number;     // Optional: Randomness (0-1)
}
```

### streamChat

```typescript
function streamChat(
  messages: Message[],
  onDelta: (delta: string) => void,
  options?: ChatOptions
): Promise<{ error?: string }>
```

---

## Environment Configuration

### Required Secrets (Supabase)

```
OPENAI_API_KEY=sk-...        # For GPT and TTS
```

### Lovable AI Gateway

The gateway URL is configured automatically:
```
https://ai.gateway.lovable.dev/v1/
```

No additional configuration needed - the gateway handles routing to Gemini.

---

## Future Enhancements

### Planned
- [ ] Gemini 2.0 Flash integration
- [ ] Video generation (when available)
- [ ] Multi-modal prompts (image + text)
- [ ] Fine-tuned models for specific niches

### Considerations
- Model version pinning for consistency
- A/B testing different models
- Custom model training for brand styles

---

**Document Version:** 1.0
**Last Updated:** December 2025
