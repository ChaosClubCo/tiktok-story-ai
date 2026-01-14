import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the analytics calculations
const calculateAverageScore = (scores: number[]): number => {
  if (!scores || scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
};

const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const calculatePercentile = (value: number, dataset: number[]): number => {
  if (dataset.length === 0) return 0;
  const sorted = [...dataset].sort((a, b) => a - b);
  const count = sorted.filter(v => v < value).length;
  return Math.round((count / sorted.length) * 100);
};

const normalizeScore = (score: number, min: number, max: number): number => {
  if (max === min) return 50;
  const normalized = ((score - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

const calculateWeightedAverage = (
  values: number[],
  weights: number[]
): number => {
  if (values.length !== weights.length || values.length === 0) return 0;
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = values.reduce((acc, v, i) => acc + v * weights[i], 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
};

describe('calculateAverageScore', () => {
  it('should return 0 for empty array', () => {
    expect(calculateAverageScore([])).toBe(0);
  });

  it('should return 0 for null/undefined', () => {
    expect(calculateAverageScore(null as any)).toBe(0);
    expect(calculateAverageScore(undefined as any)).toBe(0);
  });

  it('should calculate average correctly', () => {
    expect(calculateAverageScore([10, 20, 30])).toBe(20);
    expect(calculateAverageScore([100])).toBe(100);
    expect(calculateAverageScore([1, 2, 3, 4, 5])).toBe(3);
  });

  it('should round to one decimal place', () => {
    expect(calculateAverageScore([1, 2, 3])).toBe(2);
    expect(calculateAverageScore([10, 15])).toBe(12.5);
    expect(calculateAverageScore([33, 33, 34])).toBe(33.3);
  });

  it('should handle decimal inputs', () => {
    expect(calculateAverageScore([1.5, 2.5, 3.5])).toBe(2.5);
  });
});

describe('calculateGrowthRate', () => {
  it('should return 100 for growth from 0', () => {
    expect(calculateGrowthRate(10, 0)).toBe(100);
    expect(calculateGrowthRate(1, 0)).toBe(100);
  });

  it('should return 0 for no change from 0', () => {
    expect(calculateGrowthRate(0, 0)).toBe(0);
  });

  it('should calculate positive growth correctly', () => {
    expect(calculateGrowthRate(200, 100)).toBe(100);
    expect(calculateGrowthRate(150, 100)).toBe(50);
    expect(calculateGrowthRate(110, 100)).toBe(10);
  });

  it('should calculate negative growth correctly', () => {
    expect(calculateGrowthRate(50, 100)).toBe(-50);
    expect(calculateGrowthRate(90, 100)).toBe(-10);
    expect(calculateGrowthRate(0, 100)).toBe(-100);
  });

  it('should round to whole percentages', () => {
    expect(calculateGrowthRate(133, 100)).toBe(33);
    expect(calculateGrowthRate(166, 100)).toBe(66);
  });
});

describe('calculatePercentile', () => {
  it('should return 0 for empty dataset', () => {
    expect(calculatePercentile(50, [])).toBe(0);
  });

  it('should calculate percentiles correctly', () => {
    const dataset = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    
    expect(calculatePercentile(10, dataset)).toBe(0);
    expect(calculatePercentile(55, dataset)).toBe(50);
    expect(calculatePercentile(100, dataset)).toBe(90);
  });

  it('should handle value below minimum', () => {
    const dataset = [10, 20, 30];
    expect(calculatePercentile(5, dataset)).toBe(0);
  });

  it('should handle value above maximum', () => {
    const dataset = [10, 20, 30];
    expect(calculatePercentile(50, dataset)).toBe(100);
  });
});

describe('normalizeScore', () => {
  it('should return 50 when min equals max', () => {
    expect(normalizeScore(50, 50, 50)).toBe(50);
  });

  it('should normalize to 0-100 range', () => {
    expect(normalizeScore(0, 0, 100)).toBe(0);
    expect(normalizeScore(50, 0, 100)).toBe(50);
    expect(normalizeScore(100, 0, 100)).toBe(100);
  });

  it('should handle different ranges', () => {
    expect(normalizeScore(50, 0, 200)).toBe(25);
    expect(normalizeScore(150, 100, 200)).toBe(50);
    expect(normalizeScore(-50, -100, 0)).toBe(50);
  });

  it('should clamp values outside range', () => {
    expect(normalizeScore(-10, 0, 100)).toBe(0);
    expect(normalizeScore(110, 0, 100)).toBe(100);
  });
});

describe('calculateWeightedAverage', () => {
  it('should return 0 for empty arrays', () => {
    expect(calculateWeightedAverage([], [])).toBe(0);
  });

  it('should return 0 for mismatched array lengths', () => {
    expect(calculateWeightedAverage([1, 2, 3], [1, 2])).toBe(0);
  });

  it('should return 0 for zero total weight', () => {
    expect(calculateWeightedAverage([10, 20], [0, 0])).toBe(0);
  });

  it('should calculate weighted average correctly', () => {
    expect(calculateWeightedAverage([10, 20], [1, 1])).toBe(15);
    expect(calculateWeightedAverage([10, 20], [2, 1])).toBe(13.3);
    expect(calculateWeightedAverage([100, 0], [1, 0])).toBe(100);
  });

  it('should handle complex weights', () => {
    const values = [80, 90, 70];
    const weights = [0.5, 0.3, 0.2];
    // (80*0.5 + 90*0.3 + 70*0.2) / (0.5 + 0.3 + 0.2) = (40 + 27 + 14) / 1 = 81
    expect(calculateWeightedAverage(values, weights)).toBe(81);
  });
});
