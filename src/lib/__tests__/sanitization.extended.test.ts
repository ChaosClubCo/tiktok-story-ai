import { describe, it, expect } from 'vitest';
import { 
  sanitizeText, 
  sanitizeNumber, 
  sanitizeEmail, 
  sanitizeUrl, 
  escapeHtml,
  validateFormInput,
  sanitizeChartData,
  sanitizeObject 
} from '../sanitization';

describe('sanitization extended tests', () => {
  describe('sanitizeEmail', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail(undefined)).toBe('');
    });

    it('should validate and return valid emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('user.name@domain.co.uk')).toBe('user.name@domain.co.uk');
      expect(sanitizeEmail('user+tag@gmail.com')).toBe('user+tag@gmail.com');
    });

    it('should lowercase email addresses', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
      expect(sanitizeEmail('User@Domain.Com')).toBe('user@domain.com');
    });

    it('should return empty string for invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBe('');
      expect(sanitizeEmail('@domain.com')).toBe('');
      expect(sanitizeEmail('user@')).toBe('');
      expect(sanitizeEmail('user@@domain.com')).toBe('');
    });

    it('should strip dangerous content before validation', () => {
      expect(sanitizeEmail('<script>alert(1)</script>test@example.com')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
    });

    it('should validate http/https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://test.org/path')).toBe('http://test.org/path');
    });

    it('should reject non-http protocols by default', () => {
      expect(sanitizeUrl('ftp://example.com')).toBe('');
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should allow custom protocols', () => {
      expect(sanitizeUrl('ftp://files.example.com', ['ftp:'])).toBe('ftp://files.example.com/');
    });

    it('should return empty for invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBe('');
      expect(sanitizeUrl('://missing-protocol.com')).toBe('');
    });

    it('should handle URLs with query params', () => {
      const url = 'https://example.com/search?q=test&page=1';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should handle URLs with fragments', () => {
      const url = 'https://example.com/page#section';
      expect(sanitizeUrl(url)).toBe(url);
    });
  });

  describe('escapeHtml', () => {
    it('should return empty string for null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(escapeHtml("'single'")).toBe('&#x27;single&#x27;');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape forward slash', () => {
      expect(escapeHtml('</script>')).toBe('&lt;&#x2F;script&gt;');
    });

    it('should handle mixed content', () => {
      const input = '<a href="test">Link & Text</a>';
      const expected = '&lt;a href=&quot;test&quot;&gt;Link &amp; Text&lt;&#x2F;a&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('should not modify safe text', () => {
      expect(escapeHtml('Hello world')).toBe('Hello world');
      expect(escapeHtml('123 abc')).toBe('123 abc');
    });
  });

  describe('validateFormInput', () => {
    describe('text validation', () => {
      it('should validate required text', () => {
        const result = validateFormInput('', 'text', { required: true });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('required');
      });

      it('should allow empty optional text', () => {
        const result = validateFormInput('', 'text', { required: false });
        expect(result.valid).toBe(true);
      });

      it('should enforce minLength', () => {
        const result = validateFormInput('ab', 'text', { minLength: 3 });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('3');
      });

      it('should sanitize text and return valid', () => {
        const result = validateFormInput('Hello <script>', 'text');
        expect(result.valid).toBe(true);
        expect(result.value).not.toContain('<script>');
      });
    });

    describe('email validation', () => {
      it('should validate valid email', () => {
        const result = validateFormInput('test@example.com', 'email');
        expect(result.valid).toBe(true);
        expect(result.value).toBe('test@example.com');
      });

      it('should reject invalid email', () => {
        const result = validateFormInput('not-an-email', 'email');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('email');
      });

      it('should handle required empty email', () => {
        const result = validateFormInput('', 'email', { required: true });
        expect(result.valid).toBe(false);
      });
    });

    describe('url validation', () => {
      it('should validate valid URL', () => {
        const result = validateFormInput('https://example.com', 'url');
        expect(result.valid).toBe(true);
      });

      it('should reject invalid URL', () => {
        const result = validateFormInput('not-a-url', 'url');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('URL');
      });
    });

    describe('number validation', () => {
      it('should validate valid number', () => {
        const result = validateFormInput(42, 'number');
        expect(result.valid).toBe(true);
        expect(result.value).toBe(42);
      });

      it('should parse string numbers', () => {
        const result = validateFormInput('42.5', 'number');
        expect(result.valid).toBe(true);
        expect(result.value).toBe(42.5);
      });

      it('should enforce min/max bounds', () => {
        const result = validateFormInput(150, 'number', { min: 0, max: 100 });
        expect(result.valid).toBe(true);
        expect(result.value).toBe(100); // Clamped to max
      });

      it('should reject non-numeric input', () => {
        const result = validateFormInput('abc', 'number', { required: true });
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('sanitizeText edge cases', () => {
    it('should handle control characters', () => {
      const input = 'Hello\x00\x08\x0BWorld';
      const result = sanitizeText(input);
      expect(result).not.toContain('\x00');
      expect(result).not.toContain('\x08');
    });

    it('should handle CSS expressions', () => {
      const input = 'expression(alert(1))';
      const result = sanitizeText(input);
      expect(result).not.toContain('expression(');
    });

    it('should handle VBScript', () => {
      const input = 'vbscript:msgbox(1)';
      const result = sanitizeText(input);
      expect(result).not.toContain('vbscript:');
    });

    it('should handle data URIs', () => {
      const input = 'data:text/html,<script>alert(1)</script>';
      const result = sanitizeText(input);
      expect(result).not.toContain('data:');
    });

    it('should handle HTML comments', () => {
      const input = '<!-- comment -->';
      const result = sanitizeText(input);
      expect(result).not.toContain('<!--');
      expect(result).not.toContain('-->');
    });

    it('should respect custom maxLength', () => {
      const input = 'a'.repeat(100);
      const result = sanitizeText(input, 50);
      expect(result.length).toBe(50);
    });
  });

  describe('sanitizeNumber edge cases', () => {
    it('should handle negative min/max', () => {
      expect(sanitizeNumber(-50, 0, { min: -100, max: -10 })).toBe(-50);
      expect(sanitizeNumber(-5, 0, { min: -100, max: -10 })).toBe(-10);
      expect(sanitizeNumber(-150, 0, { min: -100, max: -10 })).toBe(-100);
    });

    it('should handle very large numbers', () => {
      expect(sanitizeNumber(1e20)).toBe(1e20);
    });

    it('should handle scientific notation strings', () => {
      expect(sanitizeNumber('1e5')).toBe(100000);
    });

    it('should handle whitespace-only strings', () => {
      expect(sanitizeNumber('   ')).toBe(0);
    });
  });
});
