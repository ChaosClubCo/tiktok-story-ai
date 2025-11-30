/**
 * Video Template Library
 * Pre-configured styles, transitions, and effects for different content types
 */

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: 'educational' | 'entertainment' | 'documentary' | 'promotional' | 'social';
  thumbnail: string;
  settings: {
    visualStyle: string;
    colorGrading: string;
    transitionType: 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide';
    transitionDuration: number;
    textOverlayStyle?: string;
    filterPreset?: string;
    aspectRatioRecommended: '9:16' | '16:9' | '1:1';
  };
  musicSuggestion?: string;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, minimalist aesthetic with smooth transitions',
    category: 'promotional',
    thumbnail: '🎨',
    settings: {
      visualStyle: 'minimalist, clean lines, modern, professional',
      colorGrading: 'high contrast, desaturated, cool tones',
      transitionType: 'fade',
      transitionDuration: 0.5,
      textOverlayStyle: 'sans-serif, bold, minimal',
      filterPreset: 'clean',
      aspectRatioRecommended: '16:9',
    },
    musicSuggestion: 'ambient-electronic',
  },
  {
    id: 'cinematic-drama',
    name: 'Cinematic Drama',
    description: 'Epic, dramatic with film-like quality',
    category: 'entertainment',
    thumbnail: '🎬',
    settings: {
      visualStyle: 'cinematic, dramatic lighting, epic scale, film grain',
      colorGrading: 'warm tones, high contrast, rich shadows',
      transitionType: 'dissolve',
      transitionDuration: 1.0,
      textOverlayStyle: 'serif, elegant, cinematic',
      filterPreset: 'cinematic',
      aspectRatioRecommended: '16:9',
    },
    musicSuggestion: 'epic-orchestral',
  },
  {
    id: 'vibrant-social',
    name: 'Vibrant Social',
    description: 'Energetic, colorful, perfect for social media',
    category: 'social',
    thumbnail: '✨',
    settings: {
      visualStyle: 'vibrant, energetic, colorful, dynamic',
      colorGrading: 'saturated colors, bright, punchy',
      transitionType: 'zoom',
      transitionDuration: 0.3,
      textOverlayStyle: 'bold, modern, animated',
      filterPreset: 'vibrant',
      aspectRatioRecommended: '9:16',
    },
    musicSuggestion: 'upbeat-pop',
  },
  {
    id: 'educational-clear',
    name: 'Educational Clear',
    description: 'Clear, informative with easy-to-follow visuals',
    category: 'educational',
    thumbnail: '📚',
    settings: {
      visualStyle: 'clear, well-lit, informative, professional',
      colorGrading: 'natural, balanced, clear',
      transitionType: 'wipe',
      transitionDuration: 0.4,
      textOverlayStyle: 'readable, sans-serif, clear hierarchy',
      filterPreset: 'neutral',
      aspectRatioRecommended: '16:9',
    },
    musicSuggestion: 'soft-background',
  },
  {
    id: 'documentary-authentic',
    name: 'Documentary Authentic',
    description: 'Realistic, authentic storytelling style',
    category: 'documentary',
    thumbnail: '🎥',
    settings: {
      visualStyle: 'realistic, documentary style, natural lighting',
      colorGrading: 'natural colors, slight desaturation, authentic',
      transitionType: 'slide',
      transitionDuration: 0.6,
      textOverlayStyle: 'simple, readable, documentary style',
      filterPreset: 'natural',
      aspectRatioRecommended: '16:9',
    },
    musicSuggestion: 'ambient-subtle',
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    description: 'High-tech, futuristic with digital elements',
    category: 'promotional',
    thumbnail: '🚀',
    settings: {
      visualStyle: 'futuristic, high-tech, digital, sleek',
      colorGrading: 'cool tones, neon accents, high contrast',
      transitionType: 'zoom',
      transitionDuration: 0.4,
      textOverlayStyle: 'futuristic, geometric, glowing',
      filterPreset: 'tech',
      aspectRatioRecommended: '16:9',
    },
    musicSuggestion: 'electronic-futuristic',
  },
];

export function getTemplateById(id: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: VideoTemplate['category']): VideoTemplate[] {
  return VIDEO_TEMPLATES.filter(t => t.category === category);
}
