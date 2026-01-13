# AI Integration Guide

## Overview

This application integrates with multiple AI providers through the **Lovable AI Gateway**, providing a unified interface for image generation, text processing, and audio synthesis.

## Lovable AI Gateway

The Lovable AI Gateway is a unified API that provides access to:
- Google Gemini models
- OpenAI models
- Future AI providers

**Gateway URL**: `https://ai.gateway.lovable.dev/v1/chat/completions`

### Authentication
All requests require the `LOVABLE_API_KEY` secret:
```typescript
Authorization: Bearer ${LOVABLE_API_KEY}
```

## Available Models

### Image Generation Models

#### google/gemini-3-pro-image-preview (DEFAULT)
- **Best Quality**: Next-generation image model
- **Use Cases**: High-quality scene visuals, hero images, professional content
- **Resolution**: Ultra-high resolution
- **Speed**: ~5-10 seconds per image
- **Cost**: Higher per request

#### google/gemini-2.5-flash-image
- **Fast & Efficient**: Quick generation
- **Use Cases**: Rapid prototyping, previews, simple visuals
- **Resolution**: High resolution
- **Speed**: ~2-5 seconds per image
- **Cost**: Lower per request

### Chat/Text Models

#### google/gemini-2.5-flash (DEFAULT)
- **Balanced**: Speed and quality
- **Context Window**: 1M tokens
- **Use Cases**: Script generation, analysis, general chat
- **Speed**: Fast responses
- **Cost**: Moderate

#### google/gemini-2.5-pro
- **Best Quality**: Maximum accuracy
- **Context Window**: 1M tokens
- **Use Cases**: Complex reasoning, detailed analysis
- **Speed**: Slower than Flash
- **Cost**: Higher per request

#### google/gemini-2.5-flash-lite
- **Fastest**: Minimal latency
- **Context Window**: 1M tokens
- **Use Cases**: Simple tasks, classification
- **Speed**: Very fast
- **Cost**: Lowest per request

### Audio Models (OpenAI)

#### tts-1 (DEFAULT)
- **Standard Quality**: Good for most use cases
- **Voices**: alloy, echo, fable, onyx, nova, shimmer
- **Speed**: Fast generation
- **Cost**: Standard pricing

#### tts-1-hd
- **High Definition**: Best audio quality
- **Voices**: Same as tts-1
- **Speed**: Similar to tts-1
- **Cost**: Higher per request

## Model Configuration

### Centralized Configuration
File: `src/lib/ai/modelConfig.ts`

```typescript
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
  audio: {
    default: 'tts-1',
    hd: 'tts-1-hd',
  },
};
```

## Client-Side Integration

### Using Lovable AI Client
File: `src/lib/ai/lovableAI.ts`

#### Generate Image
```typescript
import { generateImage } from '@/lib/ai/lovableAI';

const result = await generateImage({
  prompt: 'A cinematic sunset over mountains',
  aspectRatio: '16:9', // Optional
  model: 'google/gemini-3-pro-image-preview', // Optional
});

if (result.error) {
  console.error(result.error);
} else {
  console.log('Image URL:', result.imageUrl);
}
```

#### Chat with AI
```typescript
import { chat } from '@/lib/ai/lovableAI';

const result = await chat(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Write a short story.' },
  ],
  {
    model: 'google/gemini-2.5-flash', // Optional
    maxTokens: 1000, // Optional
  }
);

if (result.error) {
  console.error(result.error);
} else {
  console.log('Response:', result.response);
}
```

#### Stream Chat Responses
```typescript
import { streamChat } from '@/lib/ai/lovableAI';

await streamChat(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Tell me a story.' },
  ],
  (delta) => {
    // Handle each token as it arrives
    console.log('Token:', delta);
  },
  {
    model: 'google/gemini-2.5-flash',
  }
);
```

## Edge Function Integration

### Using Shared AI Client
File: `supabase/functions/_shared/aiClient.ts`

#### Generate Image
```typescript
import { generateImage, AI_MODELS } from '../_shared/aiClient.ts';

const result = await generateImage({
  prompt: 'Ultra high resolution: A modern office space',
  model: AI_MODELS.imageGeneration.default,
});

if (result.error) {
  console.error('Image generation failed:', result.error);
  return new Response(
    JSON.stringify({ error: result.error }),
    { status: 500 }
  );
}

console.log('Generated image:', result.imageUrl);
```

#### Chat with AI
```typescript
import { chat, AI_MODELS } from '../_shared/aiClient.ts';

const result = await chat(
  [
    { role: 'system', content: 'You are a script analyst.' },
    { role: 'user', content: scriptContent },
  ],
  {
    model: AI_MODELS.chat.pro,
    maxTokens: 2000,
  }
);

if (result.error) {
  throw new Error(result.error);
}

return new Response(
  JSON.stringify({ analysis: result.response }),
  { headers: corsHeaders }
);
```

## Rate Limiting & Error Handling

### Rate Limit Errors (429)
When rate limits are exceeded:
```typescript
if (error.includes('Rate limit')) {
  // Fallback to faster/cheaper model
  const fallback = await generateImage({
    prompt,
    model: AI_MODELS.imageGeneration.fast,
  });
}
```

### Payment Required Errors (402)
When credits are depleted:
```typescript
if (error.includes('Payment required')) {
  toast({
    title: 'Credits depleted',
    description: 'Please add credits to your workspace.',
    variant: 'destructive',
  });
}
```

### Retry Strategy
```typescript
let attempts = 0;
const maxAttempts = 3;

while (attempts < maxAttempts) {
  const result = await generateImage({ prompt });
  
  if (!result.error) {
    return result;
  }
  
  if (result.error.includes('Rate limit')) {
    await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
    attempts++;
  } else {
    throw new Error(result.error);
  }
}
```

## Best Practices

### Prompt Engineering

#### Image Generation
```typescript
// ❌ Bad: Vague prompt
prompt: "a scene"

// ✅ Good: Detailed, specific prompt
prompt: "Ultra high resolution, cinematic, professional: A modern office with natural lighting, minimalist design, plants, large windows overlooking a city"

// ✅ With aspect ratio
prompt: "16:9 aspect ratio image: A sunset over mountains. Ultra high resolution."
```

#### Chat/Text Generation
```typescript
// ✅ Clear system prompt
messages: [
  {
    role: 'system',
    content: 'You are a professional script writer specializing in viral social media content. Keep responses concise and engaging.'
  },
  {
    role: 'user',
    content: `Write a 30-second TikTok script about ${topic}`
  }
]
```

### Model Selection

#### Choose Based on Requirements
```typescript
// High-quality final output
model: AI_MODELS.imageGeneration.default

// Quick preview/draft
model: AI_MODELS.imageGeneration.fast

// Complex reasoning required
model: AI_MODELS.chat.pro

// Simple classification/summary
model: AI_MODELS.chat.lite
```

### Performance Optimization

#### Parallel Requests
```typescript
// Generate multiple scenes in parallel
const results = await Promise.all(
  scenes.map(scene => 
    generateImage({ prompt: scene.visual_prompt })
  )
);
```

#### Progress Tracking
```typescript
let completed = 0;
for (const scene of scenes) {
  const result = await generateImage({ prompt: scene.visual_prompt });
  completed++;
  onProgress(completed / scenes.length * 100);
}
```

### Error Recovery
```typescript
try {
  const result = await generateImage({ prompt });
  return result.imageUrl;
} catch (error) {
  // Log error
  console.error('Image generation failed:', error);
  
  // Return placeholder or retry
  return await fallbackGeneration(prompt);
}
```

## Cost Optimization

### Strategies
1. **Use appropriate models**: Don't use Pro for simple tasks
2. **Cache results**: Store generated content
3. **Batch requests**: Generate multiple items together
4. **Implement fallbacks**: Use cheaper models when possible
5. **Rate limit users**: Prevent abuse

### Example Implementation
```typescript
// Check cache first
const cached = await getCachedImage(prompt);
if (cached) return cached;

// Try default model
let result = await generateImage({ 
  prompt,
  model: AI_MODELS.imageGeneration.default 
});

// Fallback to fast model on rate limit
if (result.error?.includes('Rate limit')) {
  result = await generateImage({ 
    prompt,
    model: AI_MODELS.imageGeneration.fast 
  });
}

// Cache successful result
if (!result.error) {
  await cacheImage(prompt, result.imageUrl);
}

return result;
```

## Monitoring & Analytics

### Track Usage
```typescript
// Log AI operations
console.log('AI Request:', {
  type: 'image_generation',
  model: AI_MODELS.imageGeneration.default,
  prompt: prompt.substring(0, 100),
  timestamp: new Date().toISOString(),
});

// Track success/failure rates
if (result.error) {
  analytics.track('ai_generation_failed', {
    model,
    error: result.error,
  });
} else {
  analytics.track('ai_generation_success', {
    model,
    duration: Date.now() - startTime,
  });
}
```

## Troubleshooting

### Common Issues

#### "LOVABLE_API_KEY is not configured"
- Ensure secret is added in Supabase
- Check edge function has access to secrets

#### "Rate limit exceeded"
- Implement retry logic
- Use fallback models
- Add delays between requests

#### "Payment required"
- Add credits to Lovable workspace
- Implement user-facing error messages

#### Image URL is data:image/png;base64,...
- This is correct! Base64-encoded images
- Display with `<img src={imageUrl} />`
- Can be uploaded to storage if needed

### Debug Logging
```typescript
// Enable detailed logging
console.log('AI Request:', {
  model,
  promptLength: prompt.length,
  options,
});

console.log('AI Response:', {
  hasError: !!result.error,
  hasImageUrl: !!result.imageUrl,
  imageUrlLength: result.imageUrl?.length,
});
```
