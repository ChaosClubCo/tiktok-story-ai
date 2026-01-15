import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn(),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
      upsert: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

describe('Edge Functions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Login Rate Limit Function', () => {
    it('should allow first login check', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { allowed: true, blocked: false, remainingAttempts: 8, requiresCaptcha: false },
        error: null,
      });

      const result = await supabase.functions.invoke('login-rate-limit', {
        body: { action: 'check' },
      });

      expect(result.data?.allowed).toBe(true);
    });

    it('should block after max attempts', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { allowed: false, blocked: true, retryAfterSeconds: 900 },
        error: null,
      });

      const result = await supabase.functions.invoke('login-rate-limit', {
        body: { action: 'record_attempt', success: false },
      });

      expect(result.data?.blocked).toBe(true);
    });
  });

  describe('Save Script Function', () => {
    it('should save script successfully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, script: { id: 'script-123', title: 'Test Script' } },
        error: null,
      });

      const result = await supabase.functions.invoke('save-script', {
        body: { title: 'Test', content: 'Content', niche: 'drama', length: 'short', tone: 'dramatic' },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should reject missing fields', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Missing required fields' },
        error: null,
      });

      const result = await supabase.functions.invoke('save-script', { body: { title: 'Test' } });
      expect(result.data?.error).toContain('Missing');
    });
  });

  describe('Analyze Script Function', () => {
    it('should analyze script', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, analysis: { viral_score: 85 } },
        error: null,
      });

      const result = await supabase.functions.invoke('analyze-script', {
        body: { content: 'Test content', title: 'Test', niche: 'drama' },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.analysis.viral_score).toBe(85);
    });
  });

  describe('User 2FA Function', () => {
    it('should setup 2FA', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, secret: 'TEST123', uri: 'otpauth://totp/Test', backupCodes: ['CODE1'] },
        error: null,
      });

      const result = await supabase.functions.invoke('user-2fa', { body: { action: 'setup' } });
      expect(result.data?.success).toBe(true);
      expect(result.data?.secret).toBeDefined();
    });

    it('should verify 2FA code', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, verified: true },
        error: null,
      });

      const result = await supabase.functions.invoke('user-2fa', { body: { action: 'verify', code: '123456' } });
      expect(result.data?.verified).toBe(true);
    });
  });

  describe('Verify Admin Access Function', () => {
    it('should authorize admin', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: true, userId: 'admin-123' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', { body: {} });
      expect(result.data?.authorized).toBe(true);
    });

    it('should reject non-admin', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: false, error: 'Forbidden' },
        error: { message: 'Forbidden', status: 403 } as any,
      });

      const result = await supabase.functions.invoke('verify-admin-access', { body: {} });
      expect(result.data?.authorized).toBe(false);
    });
  });

  describe('Video Generation Functions', () => {
    it('should create video project', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, project: { id: 'project-123', status: 'pending' } },
        error: null,
      });

      const result = await supabase.functions.invoke('generate-video-project', {
        body: { scriptId: 'script-123', title: 'My Video' },
      });

      expect(result.data?.success).toBe(true);
    });
  });

  describe('Subscription Functions', () => {
    it('should check subscription', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { subscribed: true, tier: 'pro' },
        error: null,
      });

      const result = await supabase.functions.invoke('check-subscription', { body: {} });
      expect(result.data?.subscribed).toBe(true);
    });
  });
});
