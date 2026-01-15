import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock analytics module
vi.mock('../analytics', () => ({
  analytics: {
    track: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

describe('Error Tracking Utilities', () => {
  describe('parseStackTrace', () => {
    const parseStackTrace = (stack?: string): Array<{ file: string; line: number; column: number; function: string }> => {
      if (!stack) return [];
      
      const lines = stack.split('\n').slice(1);
      const parsed: Array<{ file: string; line: number; column: number; function: string }> = [];
      
      for (const line of lines.slice(0, 10)) {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) ||
                      line.match(/at\s+(.+?):(\d+):(\d+)/);
        
        if (match) {
          if (match.length === 5) {
            parsed.push({
              function: match[1] || 'anonymous',
              file: match[2],
              line: parseInt(match[3], 10),
              column: parseInt(match[4], 10),
            });
          } else if (match.length === 4) {
            parsed.push({
              function: 'anonymous',
              file: match[1],
              line: parseInt(match[2], 10),
              column: parseInt(match[3], 10),
            });
          }
        }
      }
      
      return parsed;
    };

    it('should return empty array for undefined/null stack', () => {
      expect(parseStackTrace(undefined)).toEqual([]);
      expect(parseStackTrace('')).toEqual([]);
    });

    it('should parse standard stack trace format', () => {
      const stack = `Error: Test error
    at handleClick (http://localhost:3000/src/App.tsx:42:15)
    at onClick (http://localhost:3000/src/Button.tsx:10:5)`;

      const result = parseStackTrace(stack);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        function: 'handleClick',
        file: 'http://localhost:3000/src/App.tsx',
        line: 42,
        column: 15,
      });
    });

    it('should limit to 10 stack frames', () => {
      const lines = Array.from({ length: 15 }, (_, i) => 
        `    at func${i} (http://localhost/file.js:${i + 1}:1)`
      );
      const stack = `Error\n${lines.join('\n')}`;

      const result = parseStackTrace(stack);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should handle anonymous function format', () => {
      const stack = `Error
    at http://localhost:3000/src/index.js:5:10`;

      const result = parseStackTrace(stack);
      expect(result[0]).toEqual({
        function: 'anonymous',
        file: 'http://localhost:3000/src/index.js',
        line: 5,
        column: 10,
      });
    });
  });

  describe('createErrorInfo', () => {
    const createErrorInfo = (
      error: Error | string,
      type: 'error' | 'unhandledrejection' | 'react' | 'network',
      metadata?: Record<string, unknown>
    ) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      return {
        message: errorObj.message || String(error),
        stack: errorObj.stack,
        type,
        timestamp: new Date().toISOString(),
        url: 'http://localhost:3000/',
        userAgent: 'test-agent',
        metadata,
      };
    };

    it('should create error info from Error object', () => {
      const error = new Error('Test error message');
      const result = createErrorInfo(error, 'error');

      expect(result.message).toBe('Test error message');
      expect(result.type).toBe('error');
      expect(result.stack).toBeDefined();
    });

    it('should create error info from string', () => {
      const result = createErrorInfo('String error', 'network');

      expect(result.message).toBe('String error');
      expect(result.type).toBe('network');
    });

    it('should include metadata', () => {
      const metadata = { requestUrl: 'http://api.test/endpoint', statusCode: 500 };
      const result = createErrorInfo(new Error('API error'), 'network', metadata);

      expect(result.metadata).toEqual(metadata);
    });

    it('should include valid timestamp', () => {
      const result = createErrorInfo(new Error('Test'), 'error');
      const timestamp = new Date(result.timestamp);
      
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('getErrorStats', () => {
    const getErrorStats = (errors: Array<{ type: string }>) => {
      return {
        sessionId: 'test-session',
        totalErrors: errors.length,
        errorsByType: errors.reduce((acc, err) => {
          acc[err.type] = (acc[err.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    };

    it('should return empty stats for no errors', () => {
      const stats = getErrorStats([]);
      
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByType).toEqual({});
    });

    it('should count errors by type', () => {
      const errors = [
        { type: 'error' },
        { type: 'error' },
        { type: 'network' },
        { type: 'react' },
      ];

      const stats = getErrorStats(errors);

      expect(stats.totalErrors).toBe(4);
      expect(stats.errorsByType).toEqual({
        error: 2,
        network: 1,
        react: 1,
      });
    });
  });
});
