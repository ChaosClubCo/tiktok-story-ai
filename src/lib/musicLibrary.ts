/**
 * Background Music Library
 * Pre-selected music tracks for video backgrounds
 */

export interface MusicTrack {
  id: string;
  name: string;
  category: string;
  mood: string;
  tempo: 'slow' | 'medium' | 'fast';
  duration: number;
  url: string;
  preview?: string;
  license: string;
}

// Using royalty-free music from various sources
// In production, replace with actual licensed music URLs
export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'ambient-electronic',
    name: 'Ambient Electronic Flow',
    category: 'ambient',
    mood: 'calm, modern',
    tempo: 'slow',
    duration: 180,
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_1e2e0ce2c5.mp3',
    license: 'Pixabay License',
  },
  {
    id: 'epic-orchestral',
    name: 'Epic Cinematic',
    category: 'orchestral',
    mood: 'dramatic, inspiring',
    tempo: 'medium',
    duration: 200,
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c0e0c0e8.mp3',
    license: 'Pixabay License',
  },
  {
    id: 'upbeat-pop',
    name: 'Upbeat Pop Energy',
    category: 'pop',
    mood: 'energetic, happy',
    tempo: 'fast',
    duration: 150,
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    license: 'Pixabay License',
  },
  {
    id: 'soft-background',
    name: 'Soft Background Piano',
    category: 'acoustic',
    mood: 'peaceful, professional',
    tempo: 'slow',
    duration: 240,
    url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
    license: 'Pixabay License',
  },
  {
    id: 'ambient-subtle',
    name: 'Subtle Ambient',
    category: 'ambient',
    mood: 'neutral, subtle',
    tempo: 'slow',
    duration: 220,
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_bb630cc098.mp3',
    license: 'Pixabay License',
  },
  {
    id: 'electronic-futuristic',
    name: 'Futuristic Electronic',
    category: 'electronic',
    mood: 'tech, modern',
    tempo: 'medium',
    duration: 180,
    url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe25c21.mp3',
    license: 'Pixabay License',
  },
];

export function getMusicById(id: string): MusicTrack | undefined {
  return MUSIC_LIBRARY.find(m => m.id === id);
}

export function getMusicByCategory(category: string): MusicTrack[] {
  return MUSIC_LIBRARY.filter(m => m.category === category);
}

export function getMusicByMood(mood: string): MusicTrack[] {
  return MUSIC_LIBRARY.filter(m => m.mood.includes(mood));
}
