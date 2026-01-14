import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeNumber, sanitizeChartData, sanitizeObject } from '../sanitization';

describe('sanitizeText', () => {
  it('should return empty string for null/undefined input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText('')).toBe('');
  });

  it('should remove HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(sanitizeText('<div>Hello</div>')).toBe('divHello/div');
    expect(sanitizeText('Hello <b>World</b>')).toBe('Hello bWorld/b');
  });

  it('should remove javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeText('JAVASCRIPT:void(0)')).toBe('void(0)');
  });

  it('should remove event handlers', () => {
    expect(sanitizeText('onclick=alert(1)')).toBe('alert(1)');
    expect(sanitizeText('onmouseover=hack()')).toBe('hack()');
    expect(sanitizeText('onerror = badFunction()')).toBe(' badFunction()');
  });

  it('should trim whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
    expect(sanitizeText('\n\ttest\n\t')).toBe('test');
  });

  it('should limit length to 1000 characters', () => {
    const longString = 'a'.repeat(2000);
    expect(sanitizeText(longString).length).toBe(1000);
  });

  it('should handle mixed dangerous content', () => {
    const dangerous = '<script>javascript:onclick=alert(1)</script>';
    const result = sanitizeText(dangerous);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('javascript:');
  });
});

describe('sanitizeNumber', () => {
  it('should return default value for null/undefined input', () => {
    expect(sanitizeNumber(null)).toBe(0);
    expect(sanitizeNumber(undefined)).toBe(0);
    expect(sanitizeNumber('')).toBe(0);
  });

  it('should return custom default value', () => {
    expect(sanitizeNumber(null, 42)).toBe(42);
    expect(sanitizeNumber(undefined, -1)).toBe(-1);
  });

  it('should parse valid numbers', () => {
    expect(sanitizeNumber(42)).toBe(42);
    expect(sanitizeNumber('42')).toBe(42);
    expect(sanitizeNumber('3.14')).toBe(3.14);
    expect(sanitizeNumber(-100)).toBe(-100);
  });

  it('should handle NaN and Infinity', () => {
    expect(sanitizeNumber(NaN)).toBe(0);
    expect(sanitizeNumber(Infinity)).toBe(0);
    expect(sanitizeNumber(-Infinity)).toBe(0);
    expect(sanitizeNumber('not a number')).toBe(0);
  });

  it('should handle edge cases', () => {
    expect(sanitizeNumber(0)).toBe(0);
    expect(sanitizeNumber('0')).toBe(0);
    expect(sanitizeNumber('   42   ')).toBe(42);
  });
});

describe('sanitizeChartData', () => {
  it('should return empty array for non-array input', () => {
    expect(sanitizeChartData(null as any)).toEqual([]);
    expect(sanitizeChartData(undefined as any)).toEqual([]);
    expect(sanitizeChartData('string' as any)).toEqual([]);
  });

  it('should sanitize text fields in array of objects', () => {
    const data = [
      { name: '<script>evil</script>', value: 100 },
      { name: 'javascript:hack()', value: 200 },
    ];
    const result = sanitizeChartData(data, ['name']);
    
    expect(result[0].name).not.toContain('<');
    expect(result[0].name).not.toContain('javascript:');
    expect(result[0].value).toBe(100);
    expect(result[1].value).toBe(200);
  });

  it('should sanitize numeric fields in array of objects', () => {
    const data = [
      { name: 'Test', value: 'not a number' },
      { name: 'Test2', value: NaN },
    ];
    const result = sanitizeChartData(data, [], ['value']);
    
    expect(result[0].value).toBe(0);
    expect(result[1].value).toBe(0);
  });

  it('should sanitize both text and numeric fields', () => {
    const data = [
      { label: '<b>XSS</b>', count: 'invalid', score: 42 },
    ];
    const result = sanitizeChartData(data, ['label'], ['count']);
    
    expect(result[0].label).toBe('bXSS/b');
    expect(result[0].count).toBe(0);
    expect(result[0].score).toBe(42);
  });

  it('should preserve valid data', () => {
    const data = [
      { name: 'Valid Name', value: 100, extra: 'unchanged' },
    ];
    const result = sanitizeChartData(data, ['name'], ['value']);
    
    expect(result[0].name).toBe('Valid Name');
    expect(result[0].value).toBe(100);
    expect(result[0].extra).toBe('unchanged');
  });
});

describe('sanitizeObject', () => {
  it('should return input for non-object types', () => {
    expect(sanitizeObject(null as any)).toBe(null);
    expect(sanitizeObject(undefined as any)).toBe(undefined);
  });

  it('should sanitize specified text fields', () => {
    const obj = {
      title: '<script>alert(1)</script>',
      description: 'Safe text',
      untouched: '<html>',
    };
    const result = sanitizeObject(obj, ['title']);
    
    expect(result.title).not.toContain('<');
    expect(result.description).toBe('Safe text');
    expect(result.untouched).toBe('<html>');
  });

  it('should sanitize specified numeric fields', () => {
    const obj = {
      score: 'not a number',
      count: 42,
      rating: NaN,
    };
    const result = sanitizeObject(obj, [], ['score', 'rating']);
    
    expect(result.score).toBe(0);
    expect(result.count).toBe(42);
    expect(result.rating).toBe(0);
  });

  it('should handle both text and numeric fields', () => {
    const obj = {
      name: 'onclick=evil()',
      value: Infinity,
      other: 'unchanged',
    };
    const result = sanitizeObject(obj, ['name'], ['value']);
    
    expect(result.name).not.toContain('onclick=');
    expect(result.value).toBe(0);
    expect(result.other).toBe('unchanged');
  });
});
