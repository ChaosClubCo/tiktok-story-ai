import { describe, it, expect } from 'vitest';
import { computeWordDiff, computeMetricsDelta, DiffSegment } from '../diffUtils';

describe('diffUtils extended tests', () => {
  describe('computeWordDiff', () => {
    it('should return same segments for identical text', () => {
      const text = 'Hello world';
      const result = computeWordDiff(text, text);
      
      const sameSegments = result.filter(s => s.type === 'same');
      expect(sameSegments.length).toBeGreaterThan(0);
      expect(result.filter(s => s.type === 'add').length).toBe(0);
      expect(result.filter(s => s.type === 'remove').length).toBe(0);
    });

    it('should detect added words', () => {
      const oldText = 'Hello world';
      const newText = 'Hello beautiful world';
      const result = computeWordDiff(oldText, newText);
      
      const addedSegments = result.filter(s => s.type === 'add');
      expect(addedSegments.some(s => s.text === 'beautiful')).toBe(true);
    });

    it('should detect removed words', () => {
      const oldText = 'Hello beautiful world';
      const newText = 'Hello world';
      const result = computeWordDiff(oldText, newText);
      
      const removedSegments = result.filter(s => s.type === 'remove');
      expect(removedSegments.some(s => s.text === 'beautiful')).toBe(true);
    });

    it('should handle empty old text', () => {
      const result = computeWordDiff('', 'Hello world');
      
      expect(result.every(s => s.type === 'add')).toBe(true);
    });

    it('should handle empty new text', () => {
      const result = computeWordDiff('Hello world', '');
      
      expect(result.every(s => s.type === 'remove')).toBe(true);
    });

    it('should handle completely different texts', () => {
      const result = computeWordDiff('apple banana', 'orange grape');
      
      const hasRemoved = result.some(s => s.type === 'remove');
      const hasAdded = result.some(s => s.type === 'add');
      
      expect(hasRemoved).toBe(true);
      expect(hasAdded).toBe(true);
    });

    it('should preserve whitespace segments', () => {
      const result = computeWordDiff('Hello  world', 'Hello  world');
      
      // Should have whitespace preserved
      expect(result.some(s => s.text.includes(' '))).toBe(true);
    });

    it('should handle word replacement', () => {
      const oldText = 'The quick brown fox';
      const newText = 'The slow brown fox';
      const result = computeWordDiff(oldText, newText);
      
      // Should have 'quick' removed and 'slow' added
      const removed = result.filter(s => s.type === 'remove');
      const added = result.filter(s => s.type === 'add');
      
      expect(removed.some(s => s.text === 'quick')).toBe(true);
      expect(added.some(s => s.text === 'slow')).toBe(true);
    });

    it('should handle multiline text', () => {
      const oldText = 'Line one\nLine two';
      const newText = 'Line one\nLine three';
      const result = computeWordDiff(oldText, newText);
      
      expect(result.some(s => s.type === 'remove' && s.text === 'two')).toBe(true);
      expect(result.some(s => s.type === 'add' && s.text === 'three')).toBe(true);
    });

    it('should handle special characters', () => {
      const oldText = 'Hello, world!';
      const newText = 'Hello; world?';
      const result = computeWordDiff(oldText, newText);
      
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('computeMetricsDelta', () => {
    it('should calculate positive delta', () => {
      const result = computeMetricsDelta(50, 75);
      
      expect(result.delta).toBe(25);
      expect(result.direction).toBe('up');
      expect(result.percentChange).toBe('+50.0%');
    });

    it('should calculate negative delta', () => {
      const result = computeMetricsDelta(100, 75);
      
      expect(result.delta).toBe(-25);
      expect(result.direction).toBe('down');
      expect(result.percentChange).toBe('-25.0%');
    });

    it('should handle no change', () => {
      const result = computeMetricsDelta(50, 50);
      
      expect(result.delta).toBe(0);
      expect(result.direction).toBe('same');
      expect(result.percentChange).toBe('+0.0%');
    });

    it('should handle zero old value', () => {
      const result = computeMetricsDelta(0, 50);
      
      expect(result.delta).toBe(50);
      expect(result.percentChange).toBe('0%');
    });

    it('should handle decimal values', () => {
      const result = computeMetricsDelta(33.33, 66.66);
      
      expect(result.delta).toBeCloseTo(33.33, 1);
      expect(result.direction).toBe('up');
    });

    it('should handle large numbers', () => {
      const result = computeMetricsDelta(1000000, 2000000);
      
      expect(result.delta).toBe(1000000);
      expect(result.direction).toBe('up');
      expect(result.percentChange).toBe('+100.0%');
    });

    it('should handle small decimals', () => {
      const result = computeMetricsDelta(0.1, 0.2);
      
      expect(result.delta).toBeCloseTo(0.1, 5);
      expect(result.direction).toBe('up');
    });

    it('should format percentage with sign', () => {
      const upResult = computeMetricsDelta(100, 150);
      const downResult = computeMetricsDelta(100, 80);
      
      expect(upResult.percentChange).toMatch(/^\+/);
      expect(downResult.percentChange).toMatch(/^-/);
    });

    it('should handle 100% decrease (to zero)', () => {
      const result = computeMetricsDelta(100, 0);
      
      expect(result.delta).toBe(-100);
      expect(result.direction).toBe('down');
      expect(result.percentChange).toBe('-100.0%');
    });
  });
});
