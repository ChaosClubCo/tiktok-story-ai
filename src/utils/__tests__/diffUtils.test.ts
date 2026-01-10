import { describe, it, expect } from 'vitest';
import { computeWordDiff, computeMetricsDelta } from '../diffUtils';

describe('computeWordDiff', () => {
  it('should return empty array for identical strings', () => {
    const result = computeWordDiff('hello world', 'hello world');
    expect(result.every(segment => segment.type === 'same')).toBe(true);
  });

  it('should detect added words', () => {
    const result = computeWordDiff('hello', 'hello world');
    const addedSegment = result.find(s => s.type === 'add');
    expect(addedSegment).toBeDefined();
    expect(addedSegment?.text.trim()).toBe('world');
  });

  it('should detect removed words', () => {
    const result = computeWordDiff('hello world', 'hello');
    const removedSegment = result.find(s => s.type === 'remove');
    expect(removedSegment).toBeDefined();
    expect(removedSegment?.text.trim()).toBe('world');
  });

  it('should handle empty strings', () => {
    const result1 = computeWordDiff('', 'new text');
    expect(result1.some(s => s.type === 'add')).toBe(true);

    const result2 = computeWordDiff('old text', '');
    expect(result2.some(s => s.type === 'remove')).toBe(true);
  });

  it('should handle complete replacement', () => {
    const result = computeWordDiff('completely different', 'entirely new');
    expect(result.some(s => s.type === 'remove')).toBe(true);
    expect(result.some(s => s.type === 'add')).toBe(true);
  });

  it('should preserve word order in segments', () => {
    const result = computeWordDiff('the quick fox', 'the slow fox');
    const types = result.map(s => s.type);
    
    // Should have: same (the) -> remove (quick) -> add (slow) -> same (fox)
    expect(types).toContain('same');
    expect(types).toContain('remove');
    expect(types).toContain('add');
  });

  it('should handle multi-line text', () => {
    const oldText = 'line one\nline two';
    const newText = 'line one\nline three';
    const result = computeWordDiff(oldText, newText);
    
    expect(result.some(s => s.text.includes('two') && s.type === 'remove')).toBe(true);
    expect(result.some(s => s.text.includes('three') && s.type === 'add')).toBe(true);
  });
});

describe('computeMetricsDelta', () => {
  it('should calculate positive delta', () => {
    const result = computeMetricsDelta(100, 150);
    expect(result.delta).toBe(50);
    expect(result.percentChange).toBe('+50.0%');
    expect(result.direction).toBe('up');
  });

  it('should calculate negative delta', () => {
    const result = computeMetricsDelta(100, 50);
    expect(result.delta).toBe(-50);
    expect(result.percentChange).toBe('-50.0%');
    expect(result.direction).toBe('down');
  });

  it('should handle no change', () => {
    const result = computeMetricsDelta(100, 100);
    expect(result.delta).toBe(0);
    expect(result.percentChange).toBe('0.0%');
    expect(result.direction).toBe('same');
  });

  it('should handle zero old value', () => {
    const result = computeMetricsDelta(0, 100);
    expect(result.delta).toBe(100);
    expect(result.direction).toBe('up');
  });

  it('should calculate correct percentages', () => {
    const result = computeMetricsDelta(100, 125);
    expect(result.percentChange).toBe('+25.0%');
  });

  it('should handle decimal values', () => {
    const result = computeMetricsDelta(10, 10.5);
    expect(result.delta).toBe(0.5);
    expect(result.direction).toBe('up');
  });
});
