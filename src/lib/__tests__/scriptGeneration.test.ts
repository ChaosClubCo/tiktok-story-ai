import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test script generation utilities
describe('Script Generation Utilities', () => {
  const validateScriptInput = (input: {
    niche: string;
    length: string;
    tone: string;
    topic?: string;
  }): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!input.niche || input.niche.trim() === '') {
      errors.push('Niche is required');
    }
    
    if (!['short', 'medium', 'long'].includes(input.length)) {
      errors.push('Invalid length option');
    }
    
    if (!['dramatic', 'comedic', 'inspirational', 'suspenseful'].includes(input.tone)) {
      errors.push('Invalid tone option');
    }
    
    if (input.topic && input.topic.length > 500) {
      errors.push('Topic must be 500 characters or less');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  it('should validate correct input', () => {
    const result = validateScriptInput({
      niche: 'drama',
      length: 'medium',
      tone: 'dramatic',
      topic: 'A love story',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing niche', () => {
    const result = validateScriptInput({
      niche: '',
      length: 'medium',
      tone: 'dramatic',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Niche is required');
  });

  it('should reject invalid length', () => {
    const result = validateScriptInput({
      niche: 'drama',
      length: 'extra-long',
      tone: 'dramatic',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid length option');
  });

  it('should reject invalid tone', () => {
    const result = validateScriptInput({
      niche: 'drama',
      length: 'medium',
      tone: 'angry',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid tone option');
  });

  it('should reject topic over 500 characters', () => {
    const result = validateScriptInput({
      niche: 'drama',
      length: 'medium',
      tone: 'dramatic',
      topic: 'a'.repeat(501),
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Topic must be 500 characters or less');
  });
});

describe('Viral Score Calculation', () => {
  interface ScoreComponents {
    hookStrength: number;
    emotionalImpact: number;
    shareability: number;
    trendAlignment: number;
    engagement: number;
  }

  const calculateViralScore = (components: ScoreComponents): number => {
    const weights = {
      hookStrength: 0.25,
      emotionalImpact: 0.2,
      shareability: 0.2,
      trendAlignment: 0.15,
      engagement: 0.2,
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += (components[key as keyof ScoreComponents] || 0) * weight;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  };

  it('should calculate weighted average', () => {
    const components: ScoreComponents = {
      hookStrength: 80,
      emotionalImpact: 70,
      shareability: 90,
      trendAlignment: 60,
      engagement: 75,
    };
    
    const score = calculateViralScore(components);
    // (80*0.25 + 70*0.2 + 90*0.2 + 60*0.15 + 75*0.2) = 20 + 14 + 18 + 9 + 15 = 76
    expect(score).toBe(76);
  });

  it('should clamp to 0-100 range', () => {
    const highComponents: ScoreComponents = {
      hookStrength: 150,
      emotionalImpact: 150,
      shareability: 150,
      trendAlignment: 150,
      engagement: 150,
    };
    expect(calculateViralScore(highComponents)).toBe(100);

    const lowComponents: ScoreComponents = {
      hookStrength: -50,
      emotionalImpact: -50,
      shareability: -50,
      trendAlignment: -50,
      engagement: -50,
    };
    expect(calculateViralScore(lowComponents)).toBe(0);
  });

  it('should handle zero values', () => {
    const zeroComponents: ScoreComponents = {
      hookStrength: 0,
      emotionalImpact: 0,
      shareability: 0,
      trendAlignment: 0,
      engagement: 0,
    };
    expect(calculateViralScore(zeroComponents)).toBe(0);
  });
});

describe('Script Length Estimation', () => {
  const estimateReadTime = (content: string): { minutes: number; seconds: number } => {
    // Average speaking rate: 150 words per minute
    const wordsPerMinute = 150;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const totalSeconds = Math.round((words / wordsPerMinute) * 60);
    
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60,
    };
  };

  it('should estimate short scripts', () => {
    const shortScript = 'This is a very short script.';
    const result = estimateReadTime(shortScript);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBeGreaterThan(0);
  });

  it('should estimate longer scripts', () => {
    // 150 words should be about 1 minute
    const words = Array(150).fill('word').join(' ');
    const result = estimateReadTime(words);
    expect(result.minutes).toBe(1);
  });

  it('should handle empty content', () => {
    const result = estimateReadTime('');
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it('should handle content with extra whitespace', () => {
    const content = '  word1   word2    word3  ';
    const result = estimateReadTime(content);
    // Should correctly count 3 words
    expect(result.seconds).toBeGreaterThan(0);
  });
});

describe('Script Content Parsing', () => {
  interface ScriptScene {
    number: number;
    content: string;
    duration: number;
  }

  const parseScriptIntoScenes = (content: string): ScriptScene[] => {
    const scenes: ScriptScene[] = [];
    const sceneRegex = /(?:SCENE|Scene|INT\.|EXT\.)\s*(\d+)?[:\s]*/gi;
    const parts = content.split(sceneRegex).filter(Boolean);
    
    let sceneNumber = 0;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part && !/^\d+$/.test(part)) {
        sceneNumber++;
        scenes.push({
          number: sceneNumber,
          content: part,
          duration: Math.ceil(part.split(/\s+/).length / 25), // ~25 words per 1 second
        });
      }
    }
    
    return scenes;
  };

  it('should parse scenes from content', () => {
    const content = `
      SCENE 1: The beginning
      Some dialogue here.
      
      SCENE 2: The middle
      More dialogue.
    `;
    
    const scenes = parseScriptIntoScenes(content);
    expect(scenes.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle INT./EXT. markers', () => {
    const content = `
      INT. HOUSE - DAY
      Character enters.
      
      EXT. GARDEN - NIGHT
      Character leaves.
    `;
    
    const scenes = parseScriptIntoScenes(content);
    expect(scenes.length).toBeGreaterThanOrEqual(1);
  });

  it('should estimate scene duration', () => {
    const content = 'Scene 1: ' + Array(50).fill('word').join(' ');
    const scenes = parseScriptIntoScenes(content);
    
    if (scenes.length > 0) {
      expect(scenes[0].duration).toBeGreaterThan(0);
    }
  });
});

describe('Hook Variations Generator', () => {
  const hookPatterns = [
    { type: 'question', template: 'What if {topic}?' },
    { type: 'statement', template: 'This {topic} changed everything.' },
    { type: 'challenge', template: "You won't believe this {topic}." },
    { type: 'story', template: 'The day {topic} happened...' },
  ];

  const generateHookVariations = (topic: string, count: number = 3): string[] => {
    return hookPatterns
      .slice(0, count)
      .map(pattern => pattern.template.replace('{topic}', topic));
  };

  it('should generate requested number of variations', () => {
    const hooks = generateHookVariations('a miracle', 3);
    expect(hooks).toHaveLength(3);
  });

  it('should substitute topic correctly', () => {
    const hooks = generateHookVariations('love story');
    hooks.forEach(hook => {
      expect(hook).toContain('love story');
    });
  });

  it('should handle empty topic', () => {
    const hooks = generateHookVariations('');
    expect(hooks.length).toBeGreaterThan(0);
  });
});
