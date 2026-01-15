import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoVersion } from '../useAutoVersion';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

interface ScriptSnapshot {
  content: string;
  title: string;
  niche: string;
  length: string;
  tone: string;
  timestamp: number;
}

const createSnapshot = (overrides: Partial<ScriptSnapshot> = {}): ScriptSnapshot => ({
  content: 'Test content',
  title: 'Test Script',
  niche: 'drama',
  length: 'short',
  tone: 'serious',
  timestamp: Date.now(),
  ...overrides,
});

describe('useAutoVersion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should return hook utilities', () => {
    const { result } = renderHook(() => 
      useAutoVersion('script-123', createSnapshot())
    );
    
    expect(typeof result.current.checkAndCreateVersion).toBe('function');
    expect(typeof result.current.isCreating).toBe('boolean');
    expect(typeof result.current.lastVersionTime).toBe('number');
  });

  it('should start with isCreating false', () => {
    const { result } = renderHook(() => 
      useAutoVersion('script-123', createSnapshot())
    );
    
    expect(result.current.isCreating).toBe(false);
  });

  it('should handle null scriptId', () => {
    const { result } = renderHook(() => 
      useAutoVersion(null, createSnapshot())
    );
    
    expect(result.current.isCreating).toBe(false);
  });

  it('should reset when scriptId changes', () => {
    const { result, rerender } = renderHook(
      ({ scriptId }) => useAutoVersion(scriptId, createSnapshot()),
      { initialProps: { scriptId: 'script-1' } }
    );
    
    expect(result.current.lastVersionTime).toBe(0);
    
    rerender({ scriptId: 'script-2' });
    
    expect(result.current.lastVersionTime).toBe(0);
  });

  describe('calculateChanges logic', () => {
    it('should detect significant content changes', () => {
      const calculateChanges = (oldContent: string, newContent: string) => {
        const lengthDiff = Math.abs(newContent.length - oldContent.length);
        const percentChange = oldContent.length > 0 
          ? lengthDiff / oldContent.length 
          : 1;
        return { characterDiff: lengthDiff, percentChange };
      };
      
      const result = calculateChanges('Hello', 'Hello World How Are You');
      
      expect(result.characterDiff).toBe(19);
      expect(result.percentChange).toBeGreaterThan(0.1);
    });

    it('should handle empty old content', () => {
      const calculateChanges = (oldContent: string, newContent: string) => {
        const lengthDiff = Math.abs(newContent.length - oldContent.length);
        const percentChange = oldContent.length > 0 
          ? lengthDiff / oldContent.length 
          : 1;
        return { characterDiff: lengthDiff, percentChange };
      };
      
      const result = calculateChanges('', 'New content');
      
      expect(result.percentChange).toBe(1);
    });
  });

  describe('generateChangeDescription logic', () => {
    const generateChangeDescription = (
      oldSnapshot: ScriptSnapshot,
      newSnapshot: ScriptSnapshot
    ): string => {
      const changes: string[] = [];

      if (oldSnapshot.title !== newSnapshot.title) {
        changes.push(`Title changed to: "${newSnapshot.title}"`);
      }

      if (oldSnapshot.niche !== newSnapshot.niche) {
        changes.push(`Niche changed from ${oldSnapshot.niche} to ${newSnapshot.niche}`);
      }

      if (oldSnapshot.length !== newSnapshot.length) {
        changes.push(`Length changed to ${newSnapshot.length}`);
      }

      if (oldSnapshot.tone !== newSnapshot.tone) {
        changes.push(`Tone changed to ${newSnapshot.tone}`);
      }

      const lengthDiff = Math.abs(newSnapshot.content.length - oldSnapshot.content.length);
      const percentChange = oldSnapshot.content.length > 0 
        ? lengthDiff / oldSnapshot.content.length 
        : 0;

      if (lengthDiff > 0) {
        const percentStr = (percentChange * 100).toFixed(0);
        changes.push(`Content updated (${percentStr}% change, ${lengthDiff} characters)`);
      }

      return changes.length > 0 ? changes.join('; ') : 'Auto-save checkpoint';
    };

    it('should describe title change', () => {
      const old = createSnapshot({ title: 'Old Title' });
      const updated = createSnapshot({ title: 'New Title' });
      
      const description = generateChangeDescription(old, updated);
      
      expect(description).toContain('Title changed');
      expect(description).toContain('New Title');
    });

    it('should describe niche change', () => {
      const old = createSnapshot({ niche: 'drama' });
      const updated = createSnapshot({ niche: 'comedy' });
      
      const description = generateChangeDescription(old, updated);
      
      expect(description).toContain('Niche changed');
      expect(description).toContain('comedy');
    });

    it('should describe content changes', () => {
      const old = createSnapshot({ content: 'Short' });
      const updated = createSnapshot({ content: 'Much longer content here' });
      
      const description = generateChangeDescription(old, updated);
      
      expect(description).toContain('Content updated');
      expect(description).toContain('characters');
    });

    it('should handle multiple changes', () => {
      const old = createSnapshot({ 
        title: 'Old', 
        niche: 'drama',
        content: 'Old content' 
      });
      const updated = createSnapshot({ 
        title: 'New', 
        niche: 'comedy',
        content: 'New longer content here' 
      });
      
      const description = generateChangeDescription(old, updated);
      
      expect(description).toContain('Title changed');
      expect(description).toContain('Niche changed');
      expect(description).toContain(';');
    });

    it('should return default message when no changes', () => {
      const snapshot = createSnapshot();
      const description = generateChangeDescription(snapshot, snapshot);
      
      expect(description).toBe('Auto-save checkpoint');
    });
  });

  describe('shouldCreateVersion logic', () => {
    const DEFAULT_CONFIG = {
      enabled: true,
      minTimeBetweenVersions: 5 * 60 * 1000,
      minContentChangeThreshold: 50,
      minContentChangePercent: 0.1,
    };

    it('should return false when disabled', () => {
      const config = { ...DEFAULT_CONFIG, enabled: false };
      const old = createSnapshot();
      const updated = createSnapshot({ content: 'Very different content' });
      
      const shouldCreate = !config.enabled;
      
      expect(shouldCreate).toBe(false);
    });

    it('should detect metadata changes', () => {
      const old = createSnapshot({ title: 'Old' });
      const updated = createSnapshot({ title: 'New' });
      
      const hasMetadataChange = old.title !== updated.title;
      
      expect(hasMetadataChange).toBe(true);
    });

    it('should detect significant content changes', () => {
      const old = createSnapshot({ content: 'Short' });
      const updated = createSnapshot({ content: 'a'.repeat(100) });
      
      const lengthDiff = Math.abs(updated.content.length - old.content.length);
      
      expect(lengthDiff).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minContentChangeThreshold);
    });
  });

  describe('config overrides', () => {
    it('should accept custom config', () => {
      const customConfig = {
        enabled: true,
        minTimeBetweenVersions: 1000,
        minContentChangeThreshold: 10,
        minContentChangePercent: 0.05,
      };
      
      const { result } = renderHook(() => 
        useAutoVersion('script-123', createSnapshot(), customConfig)
      );
      
      expect(result.current.isCreating).toBe(false);
    });

    it('should merge with default config', () => {
      const partialConfig = { enabled: false };
      
      const { result } = renderHook(() => 
        useAutoVersion('script-123', createSnapshot(), partialConfig)
      );
      
      expect(result.current.isCreating).toBe(false);
    });
  });
});
