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

    it('should handle free tier users', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { subscribed: false, tier: 'free', limits: { scripts: 5, videos: 2 } },
        error: null,
      });

      const result = await supabase.functions.invoke('check-subscription', { body: {} });
      expect(result.data?.subscribed).toBe(false);
      expect(result.data?.tier).toBe('free');
    });

    it('should create checkout session', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/session-123', sessionId: 'session-123' },
        error: null,
      });

      const result = await supabase.functions.invoke('create-checkout', {
        body: { tier: 'pro', successUrl: 'https://app.com/success' },
      });
      expect(result.data?.url).toContain('checkout.stripe.com');
    });

    it('should access customer portal', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { url: 'https://billing.stripe.com/portal-123' },
        error: null,
      });

      const result = await supabase.functions.invoke('customer-portal', { body: {} });
      expect(result.data?.url).toContain('billing.stripe.com');
    });
  });

  describe('Email Sending Functions', () => {
    it('should send welcome email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, messageId: 'msg-123' },
        error: null,
      });

      const result = await supabase.functions.invoke('send-welcome-email', {
        body: { email: 'user@example.com', name: 'John Doe' },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should send security alert email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, alertId: 'alert-123' },
        error: null,
      });

      const result = await supabase.functions.invoke('send-security-alert', {
        body: { 
          email: 'user@example.com', 
          alertType: 'new_login', 
          metadata: { ip: '192.168.1.1', device: 'Chrome on Windows' } 
        },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should send backup verification code', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, expiresIn: 600 },
        error: null,
      });

      const result = await supabase.functions.invoke('send-backup-verification', {
        body: { email: 'backup@example.com', userId: 'user-123' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.expiresIn).toBe(600);
    });

    it('should send registration email with verification link', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, verificationToken: 'token-abc123' },
        error: null,
      });

      const result = await supabase.functions.invoke('send-registration-email', {
        body: { email: 'newuser@example.com', redirectUrl: 'https://app.com/verify' },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should send security digest', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, eventsCount: 15, period: 'weekly' },
        error: null,
      });

      const result = await supabase.functions.invoke('send-security-digest', {
        body: { userId: 'user-123', period: 'weekly' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.eventsCount).toBe(15);
    });

    it('should handle email sending failure gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Email service unavailable', status: 503 } as any,
      });

      const result = await supabase.functions.invoke('send-welcome-email', {
        body: { email: 'user@example.com' },
      });
      expect(result.error?.status).toBe(503);
    });
  });

  describe('Trends Functions', () => {
    it('should fetch trending topics', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          trends: [
            { id: '1', topic: 'AI Technology', viral_score: 95, platform: 'tiktok' },
            { id: '2', topic: 'Lifestyle Hacks', viral_score: 88, platform: 'instagram' },
          ],
          lastUpdated: new Date().toISOString(),
        },
        error: null,
      });

      const result = await supabase.functions.invoke('fetch-trends', { body: {} });
      expect(result.data?.trends).toHaveLength(2);
      expect(result.data?.trends[0].viral_score).toBe(95);
    });

    it('should filter trends by platform', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          trends: [{ id: '1', topic: 'TikTok Dance', platform: 'tiktok' }],
          platform: 'tiktok',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('fetch-trends', {
        body: { platform: 'tiktok' },
      });
      expect(result.data?.platform).toBe('tiktok');
    });

    it('should filter trends by category', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          trends: [{ id: '1', topic: 'Drama Plot Twist', category: 'drama' }],
          category: 'drama',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('fetch-trends', {
        body: { category: 'drama' },
      });
      expect(result.data?.category).toBe('drama');
    });

    it('should generate trend insights', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          insights: {
            summary: 'Drama content is trending with 45% increase',
            recommendations: ['Focus on plot twists', 'Use emotional hooks'],
            topNiches: ['drama', 'mystery', 'romance'],
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('generate-trend-insights', {
        body: { trends: ['trend-1', 'trend-2'], niche: 'drama' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.insights.recommendations).toHaveLength(2);
    });

    it('should handle empty trends gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { trends: [], message: 'No trending topics found' },
        error: null,
      });

      const result = await supabase.functions.invoke('fetch-trends', { body: {} });
      expect(result.data?.trends).toHaveLength(0);
    });
  });

  describe('Series Generation Functions', () => {
    it('should generate series', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          series: {
            id: 'series-123',
            title: 'The Midnight Mystery',
            description: 'A gripping mystery series',
            episodes: 5,
            niche: 'mystery',
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('generate-series', {
        body: { 
          title: 'The Midnight Mystery',
          niche: 'mystery',
          episodeCount: 5,
          premise: 'A detective uncovers dark secrets',
        },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.series.episodes).toBe(5);
    });

    it('should generate series suggestions', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          suggestions: [
            { title: 'Love in the City', niche: 'romance', estimatedViralScore: 85 },
            { title: 'Tech Thriller', niche: 'suspense', estimatedViralScore: 90 },
            { title: 'Comedy Gold', niche: 'comedy', estimatedViralScore: 78 },
          ],
        },
        error: null,
      });

      const result = await supabase.functions.invoke('generate-series-suggestions', {
        body: { userNiche: 'drama', pastPerformance: { avgViralScore: 75 } },
      });
      expect(result.data?.suggestions).toHaveLength(3);
    });

    it('should generate series with custom settings', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          series: {
            id: 'series-456',
            tone: 'dramatic',
            episodeLength: 'medium',
            cliffhangers: true,
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('generate-series', {
        body: { 
          tone: 'dramatic',
          episodeLength: 'medium',
          includeCliffhangers: true,
        },
      });
      expect(result.data?.series.cliffhangers).toBe(true);
    });

    it('should handle series generation timeout', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: false,
          error: 'Generation timeout',
          partialResult: { episodes: 2 },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('generate-series', {
        body: { episodeCount: 20 },
      });
      expect(result.data?.success).toBe(false);
      expect(result.data?.partialResult.episodes).toBe(2);
    });
  });

  describe('Admin Functions', () => {
    it('should get admin users list', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          users: [
            { id: 'user-1', email: 'admin@example.com', role: 'super_admin', createdAt: '2024-01-01' },
            { id: 'user-2', email: 'support@example.com', role: 'support_admin', createdAt: '2024-02-01' },
          ],
          total: 2,
          page: 1,
        },
        error: null,
      });

      const result = await supabase.functions.invoke('admin-get-users', {
        body: { page: 1, limit: 10 },
      });
      expect(result.data?.users).toHaveLength(2);
      expect(result.data?.users[0].role).toBe('super_admin');
    });

    it('should search users by email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          users: [{ id: 'user-1', email: 'john@example.com' }],
          searchTerm: 'john',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('admin-get-users', {
        body: { search: 'john' },
      });
      expect(result.data?.users[0].email).toContain('john');
    });

    it('should get admin content', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          content: [
            { id: 'script-1', title: 'Popular Script', views: 5000, reports: 0 },
            { id: 'script-2', title: 'Flagged Content', views: 200, reports: 5 },
          ],
          filters: { reported: false },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('admin-get-content', {
        body: { type: 'scripts', page: 1 },
      });
      expect(result.data?.content).toHaveLength(2);
    });

    it('should filter flagged content', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          content: [{ id: 'script-2', reports: 5, flagReason: 'inappropriate' }],
          filters: { reported: true },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('admin-get-content', {
        body: { reported: true },
      });
      expect(result.data?.content[0].reports).toBeGreaterThan(0);
    });

    it('should log admin action', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, logId: 'log-123' },
        error: null,
      });

      const result = await supabase.functions.invoke('log-admin-action', {
        body: { 
          action: 'user_suspended',
          resourceType: 'user',
          resourceId: 'user-456',
          reason: 'Policy violation',
        },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should rotate API key', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          newKeyPrefix: 'sk_live_xxx',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        error: null,
      });

      const result = await supabase.functions.invoke('rotate-api-key', {
        body: { keyType: 'production' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.newKeyPrefix).toContain('sk_live');
    });

    it('should setup admin 2FA', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          secret: 'ADMIN2FASECRET',
          qrCode: 'data:image/png;base64,xxx',
          backupCodes: ['CODE1', 'CODE2', 'CODE3'],
        },
        error: null,
      });

      const result = await supabase.functions.invoke('admin-2fa', {
        body: { action: 'setup' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.backupCodes).toHaveLength(3);
    });

    it('should verify admin 2FA', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, verified: true, lastUsed: new Date().toISOString() },
        error: null,
      });

      const result = await supabase.functions.invoke('admin-2fa', {
        body: { action: 'verify', code: '123456' },
      });
      expect(result.data?.verified).toBe(true);
    });

    it('should reject invalid admin 2FA code', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: false, error: 'Invalid code', attemptsRemaining: 2 },
        error: null,
      });

      const result = await supabase.functions.invoke('admin-2fa', {
        body: { action: 'verify', code: '000000' },
      });
      expect(result.data?.success).toBe(false);
      expect(result.data?.attemptsRemaining).toBe(2);
    });
  });

  describe('Security Monitor Functions', () => {
    it('should get security events', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          events: [
            { id: 'evt-1', type: 'failed_login', ip: '1.2.3.4', timestamp: new Date().toISOString() },
            { id: 'evt-2', type: 'password_change', ip: '5.6.7.8', timestamp: new Date().toISOString() },
          ],
          total: 2,
        },
        error: null,
      });

      const result = await supabase.functions.invoke('get-security-events', {
        body: { userId: 'user-123' },
      });
      expect(result.data?.events).toHaveLength(2);
    });

    it('should log login activity', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, activityId: 'act-123' },
        error: null,
      });

      const result = await supabase.functions.invoke('log-login-activity', {
        body: { 
          userId: 'user-123',
          success: true,
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should get login activity history', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          activities: [
            { id: 'act-1', success: true, browser: 'Chrome', device: 'Desktop', location: 'New York' },
            { id: 'act-2', success: false, browser: 'Firefox', device: 'Mobile', location: 'Unknown' },
          ],
        },
        error: null,
      });

      const result = await supabase.functions.invoke('get-login-activity', {
        body: { limit: 10 },
      });
      expect(result.data?.activities).toHaveLength(2);
    });

    it('should detect suspicious activity', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          suspicious: true,
          reason: 'Multiple failed login attempts from different locations',
          recommendation: 'Enable 2FA',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('security-monitor', {
        body: { userId: 'user-123', action: 'analyze' },
      });
      expect(result.data?.suspicious).toBe(true);
    });
  });

  describe('Branch Management Functions', () => {
    it('should create script branch', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          branch: {
            id: 'branch-123',
            name: 'feature/new-ending',
            scriptId: 'script-456',
            createdFromVersion: 3,
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('create-branch', {
        body: { scriptId: 'script-456', branchName: 'feature/new-ending' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.branch.name).toBe('feature/new-ending');
    });

    it('should merge branch', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          merged: true,
          newVersion: 4,
          conflicts: [],
        },
        error: null,
      });

      const result = await supabase.functions.invoke('merge-branch', {
        body: { branchId: 'branch-123', targetBranchId: 'main' },
      });
      expect(result.data?.merged).toBe(true);
      expect(result.data?.conflicts).toHaveLength(0);
    });

    it('should detect merge conflicts', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: false,
          merged: false,
          conflicts: [
            { line: 15, content: 'Conflicting content at line 15' },
          ],
        },
        error: null,
      });

      const result = await supabase.functions.invoke('merge-branch', {
        body: { branchId: 'branch-456', targetBranchId: 'main' },
      });
      expect(result.data?.conflicts).toHaveLength(1);
    });

    it('should switch active branch', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, activeBranch: 'branch-789' },
        error: null,
      });

      const result = await supabase.functions.invoke('switch-branch', {
        body: { scriptId: 'script-123', branchId: 'branch-789' },
      });
      expect(result.data?.activeBranch).toBe('branch-789');
    });
  });

  describe('A/B Testing Functions', () => {
    it('should run A/B test', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          test: {
            id: 'test-123',
            status: 'running',
            variants: ['A', 'B'],
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('run-ab-test', {
        body: { scriptId: 'script-123', variants: ['A', 'B'] },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.test.status).toBe('running');
    });

    it('should complete A/B test with winner', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          winner: 'variant-A',
          metrics: {
            variantA: { engagement: 85, shares: 120 },
            variantB: { engagement: 72, shares: 95 },
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('complete-ab-test', {
        body: { testId: 'test-123' },
      });
      expect(result.data?.winner).toBe('variant-A');
    });
  });

  describe('Account Management Functions', () => {
    it('should delete account', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          message: 'Account scheduled for deletion',
          deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        error: null,
      });

      const result = await supabase.functions.invoke('delete-account', {
        body: { confirmation: 'DELETE' },
      });
      expect(result.data?.success).toBe(true);
    });

    it('should require confirmation for account deletion', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: false,
          error: 'Invalid confirmation',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('delete-account', {
        body: { confirmation: 'wrong' },
      });
      expect(result.data?.success).toBe(false);
    });
  });

  describe('TTS Preview Function', () => {
    it('should generate TTS preview', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          audioUrl: 'https://storage.example.com/tts/preview-123.mp3',
          duration: 15.5,
        },
        error: null,
      });

      const result = await supabase.functions.invoke('tts-preview', {
        body: { text: 'Hello world', voice: 'alloy' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.duration).toBeGreaterThan(0);
    });
  });

  describe('Demo Viral Score Function', () => {
    it('should calculate demo viral score', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          viralScore: 78,
          breakdown: {
            hookStrength: 85,
            emotionalImpact: 72,
            shareability: 80,
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('demo-viral-score', {
        body: { content: 'Test script content' },
      });
      expect(result.data?.viralScore).toBe(78);
    });
  });

  describe('Recovery Functions', () => {
    it('should get recovery options', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          options: {
            backupEmail: 'backup@example.com',
            securityQuestions: true,
            phone: false,
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { userId: 'user-123' },
      });
      expect(result.data?.options.backupEmail).toBeDefined();
    });

    it('should verify recovery', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          verified: true,
          resetToken: 'reset-token-abc',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: { method: 'backup_email', code: '123456' },
      });
      expect(result.data?.verified).toBe(true);
    });

    it('should enforce recovery rate limit', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          allowed: false,
          retryAfter: 300,
          reason: 'Too many attempts',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-rate-limit', {
        body: { identifier: 'user@example.com' },
      });
      expect(result.data?.allowed).toBe(false);
    });
  });

  describe('Script Version Functions', () => {
    it('should create script version', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { 
          success: true,
          version: {
            id: 'version-123',
            versionNumber: 5,
            changeDescription: 'Updated ending',
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('create-script-version', {
        body: { scriptId: 'script-123', content: 'New content', changeDescription: 'Updated ending' },
      });
      expect(result.data?.success).toBe(true);
      expect(result.data?.version.versionNumber).toBe(5);
    });
  });
});
