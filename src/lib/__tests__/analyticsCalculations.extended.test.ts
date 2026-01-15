import { describe, it, expect } from 'vitest';
import {
  calculateImprovementRate,
  calculateAverageViralScore,
  getBestScript,
  calculateNichePerformance,
  generateRadarData,
  calculateTypeBreakdown,
  getTopScripts,
  countHighScorers,
  Prediction,
} from '../analyticsCalculations';

// Helper to create mock predictions
const createMockPrediction = (overrides: Partial<Prediction> = {}): Prediction => ({
  viral_score: 75,
  engagement_score: 80,
  shareability_score: 70,
  hook_strength: 85,
  emotional_impact: 72,
  conflict_clarity: 68,
  pacing_quality: 78,
  dialogue_quality: 82,
  quotability: 65,
  relatability: 88,
  prediction_type: 'quick',
  niche: 'drama',
  created_at: new Date().toISOString(),
  title: 'Test Script',
  ...overrides,
});

describe('analyticsCalculations extended tests', () => {
  describe('calculateImprovementRate', () => {
    it('should return 0 for empty predictions', () => {
      expect(calculateImprovementRate([])).toBe(0);
    });

    it('should return 0 for single prediction', () => {
      const predictions = [createMockPrediction()];
      expect(calculateImprovementRate(predictions)).toBe(0);
    });

    it('should calculate positive improvement', () => {
      const predictions = [
        createMockPrediction({ viral_score: 90 }), // Latest (higher)
        createMockPrediction({ viral_score: 85 }),
        createMockPrediction({ viral_score: 80 }),
        createMockPrediction({ viral_score: 75 }),
        createMockPrediction({ viral_score: 70 }),
        createMockPrediction({ viral_score: 60 }), // Oldest (lower)
      ];
      
      const rate = calculateImprovementRate(predictions);
      expect(rate).toBeGreaterThan(0);
    });

    it('should calculate negative improvement (decline)', () => {
      const predictions = [
        createMockPrediction({ viral_score: 50 }), // Latest (lower)
        createMockPrediction({ viral_score: 60 }),
        createMockPrediction({ viral_score: 70 }),
        createMockPrediction({ viral_score: 80 }),
        createMockPrediction({ viral_score: 90 }), // Oldest (higher)
      ];
      
      const rate = calculateImprovementRate(predictions);
      expect(rate).toBeLessThan(0);
    });

    it('should handle predictions with same scores', () => {
      const predictions = Array(10).fill(null).map(() => 
        createMockPrediction({ viral_score: 75 })
      );
      
      expect(calculateImprovementRate(predictions)).toBe(0);
    });
  });

  describe('calculateAverageViralScore', () => {
    it('should return 0 for empty predictions', () => {
      expect(calculateAverageViralScore([])).toBe(0);
    });

    it('should calculate correct average', () => {
      const predictions = [
        createMockPrediction({ viral_score: 80 }),
        createMockPrediction({ viral_score: 90 }),
        createMockPrediction({ viral_score: 70 }),
      ];
      
      expect(calculateAverageViralScore(predictions)).toBe(80);
    });

    it('should round to nearest integer', () => {
      const predictions = [
        createMockPrediction({ viral_score: 73 }),
        createMockPrediction({ viral_score: 74 }),
      ];
      
      expect(calculateAverageViralScore(predictions)).toBe(74); // (73+74)/2 = 73.5 rounds to 74
    });

    it('should handle single prediction', () => {
      const predictions = [createMockPrediction({ viral_score: 85 })];
      expect(calculateAverageViralScore(predictions)).toBe(85);
    });
  });

  describe('getBestScript', () => {
    it('should return null for empty predictions', () => {
      expect(getBestScript([])).toBeNull();
    });

    it('should return the prediction with highest viral score', () => {
      const predictions = [
        createMockPrediction({ viral_score: 70, title: 'Low' }),
        createMockPrediction({ viral_score: 95, title: 'High' }),
        createMockPrediction({ viral_score: 80, title: 'Medium' }),
      ];
      
      const best = getBestScript(predictions);
      expect(best?.title).toBe('High');
      expect(best?.viral_score).toBe(95);
    });

    it('should handle tie by returning first occurrence', () => {
      const predictions = [
        createMockPrediction({ viral_score: 90, title: 'First' }),
        createMockPrediction({ viral_score: 90, title: 'Second' }),
      ];
      
      const best = getBestScript(predictions);
      expect(best?.title).toBe('First');
    });
  });

  describe('calculateNichePerformance', () => {
    it('should return empty array for no predictions', () => {
      expect(calculateNichePerformance([])).toEqual([]);
    });

    it('should group by niche correctly', () => {
      const predictions = [
        createMockPrediction({ niche: 'drama', viral_score: 80 }),
        createMockPrediction({ niche: 'drama', viral_score: 90 }),
        createMockPrediction({ niche: 'comedy', viral_score: 75 }),
      ];
      
      const result = calculateNichePerformance(predictions);
      
      expect(result.length).toBe(2);
      
      const dramaPerf = result.find(n => n.niche === 'drama');
      expect(dramaPerf?.count).toBe(2);
      expect(dramaPerf?.avgScore).toBe(85);
      expect(dramaPerf?.bestScore).toBe(90);
    });

    it('should handle null niche as Unknown', () => {
      const predictions = [
        createMockPrediction({ niche: null, viral_score: 70 }),
      ];
      
      const result = calculateNichePerformance(predictions);
      expect(result[0].niche).toBe('Unknown');
    });

    it('should sort by average score descending', () => {
      const predictions = [
        createMockPrediction({ niche: 'low', viral_score: 50 }),
        createMockPrediction({ niche: 'high', viral_score: 95 }),
        createMockPrediction({ niche: 'medium', viral_score: 75 }),
      ];
      
      const result = calculateNichePerformance(predictions);
      
      expect(result[0].niche).toBe('high');
      expect(result[1].niche).toBe('medium');
      expect(result[2].niche).toBe('low');
    });
  });

  describe('generateRadarData', () => {
    it('should return all 6 metrics', () => {
      const predictions = [createMockPrediction()];
      const result = generateRadarData(predictions);
      
      expect(result).toHaveLength(6);
      expect(result.map(r => r.metric)).toEqual([
        'Hook', 'Emotion', 'Conflict', 'Pacing', 'Dialogue', 'Quotability'
      ]);
    });

    it('should calculate averages correctly', () => {
      const predictions = [
        createMockPrediction({ hook_strength: 80 }),
        createMockPrediction({ hook_strength: 90 }),
      ];
      
      const result = generateRadarData(predictions);
      const hookScore = result.find(r => r.metric === 'Hook')?.score;
      
      expect(hookScore).toBe(85);
    });

    it('should handle empty predictions', () => {
      const result = generateRadarData([]);
      
      result.forEach(point => {
        expect(point.score).toBe(0);
      });
    });
  });

  describe('calculateTypeBreakdown', () => {
    it('should return empty array for no predictions', () => {
      expect(calculateTypeBreakdown([])).toEqual([]);
    });

    it('should count prediction types', () => {
      const predictions = [
        createMockPrediction({ prediction_type: 'quick' }),
        createMockPrediction({ prediction_type: 'quick' }),
        createMockPrediction({ prediction_type: 'detailed' }),
      ];
      
      const result = calculateTypeBreakdown(predictions);
      
      expect(result).toContainEqual({ name: 'quick', value: 2 });
      expect(result).toContainEqual({ name: 'detailed', value: 1 });
    });
  });

  describe('getTopScripts', () => {
    it('should return empty array for no predictions', () => {
      expect(getTopScripts([])).toEqual([]);
    });

    it('should return top 10 by default', () => {
      const predictions = Array(15).fill(null).map((_, i) => 
        createMockPrediction({ viral_score: i * 5 })
      );
      
      const result = getTopScripts(predictions);
      expect(result).toHaveLength(10);
    });

    it('should respect custom limit', () => {
      const predictions = Array(10).fill(null).map(() => 
        createMockPrediction()
      );
      
      expect(getTopScripts(predictions, 5)).toHaveLength(5);
      expect(getTopScripts(predictions, 3)).toHaveLength(3);
    });

    it('should sort by viral score descending', () => {
      const predictions = [
        createMockPrediction({ viral_score: 50 }),
        createMockPrediction({ viral_score: 90 }),
        createMockPrediction({ viral_score: 70 }),
      ];
      
      const result = getTopScripts(predictions);
      
      expect(result[0].viral_score).toBe(90);
      expect(result[1].viral_score).toBe(70);
      expect(result[2].viral_score).toBe(50);
    });
  });

  describe('countHighScorers', () => {
    it('should return 0 for empty predictions', () => {
      expect(countHighScorers([])).toBe(0);
    });

    it('should count scripts with score >= 80', () => {
      const predictions = [
        createMockPrediction({ viral_score: 75 }),
        createMockPrediction({ viral_score: 80 }),
        createMockPrediction({ viral_score: 85 }),
        createMockPrediction({ viral_score: 95 }),
      ];
      
      expect(countHighScorers(predictions)).toBe(3);
    });

    it('should return 0 when no high scorers', () => {
      const predictions = [
        createMockPrediction({ viral_score: 50 }),
        createMockPrediction({ viral_score: 60 }),
        createMockPrediction({ viral_score: 79 }),
      ];
      
      expect(countHighScorers(predictions)).toBe(0);
    });

    it('should include exactly 80 as high scorer', () => {
      const predictions = [
        createMockPrediction({ viral_score: 80 }),
      ];
      
      expect(countHighScorers(predictions)).toBe(1);
    });
  });
});
