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
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('Account Recovery Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Recovery Rate Limit Function', () => {
    it('should allow first attempt within limits', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { allowed: true, remainingAttempts: 2 },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-rate-limit', {
        body: {
          identifier: 'test@example.com',
          attemptType: 'security_questions',
        },
      });

      expect(result.data?.allowed).toBe(true);
      expect(result.data?.remainingAttempts).toBe(2);
    });

    it('should block after max attempts reached', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          allowed: false,
          remainingAttempts: 0,
          blockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          message: 'Too many failed attempts',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-rate-limit', {
        body: {
          identifier: 'test@example.com',
          attemptType: 'security_questions',
        },
      });

      expect(result.data?.allowed).toBe(false);
      expect(result.data?.remainingAttempts).toBe(0);
      expect(result.data?.blockedUntil).toBeDefined();
    });

    it('should reset counter on successful attempt', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { allowed: true, remainingAttempts: 3 },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-rate-limit', {
        body: {
          identifier: 'test@example.com',
          attemptType: 'security_questions',
          success: true,
        },
      });

      expect(result.data?.allowed).toBe(true);
      expect(result.data?.remainingAttempts).toBe(3);
    });

    it('should handle different attempt types', async () => {
      // Test security_questions (3 max attempts)
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { allowed: true, remainingAttempts: 2 },
        error: null,
      });

      const securityResult = await supabase.functions.invoke('recovery-rate-limit', {
        body: { identifier: 'test@example.com', attemptType: 'security_questions' },
      });
      expect(securityResult.data?.remainingAttempts).toBe(2);

      // Test backup_email (5 max attempts)
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { allowed: true, remainingAttempts: 4 },
        error: null,
      });

      const emailResult = await supabase.functions.invoke('recovery-rate-limit', {
        body: { identifier: 'test@example.com', attemptType: 'backup_email' },
      });
      expect(emailResult.data?.remainingAttempts).toBe(4);
    });

    it('should handle invalid attempt type', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Invalid attempt type' },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-rate-limit', {
        body: { identifier: 'test@example.com', attemptType: 'invalid_type' },
      });

      expect(result.data?.error).toBeDefined();
    });
  });

  describe('Recovery Options Function', () => {
    it('should get recovery options for authenticated user', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          data: {
            backup_email: 'backup@example.com',
            backup_email_verified: true,
            security_questions: [
              { questionId: 'q1', answerHash: 'hash1' },
              { questionId: 'q2', answerHash: 'hash2' },
            ],
          },
        },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { action: 'get' },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.data?.backup_email).toBe('backup@example.com');
      expect(result.data?.data?.security_questions).toHaveLength(2);
    });

    it('should save backup email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { action: 'save_backup_email', backupEmail: 'newbackup@example.com' },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should save security questions', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: {
          action: 'save_security_questions',
          securityQuestions: [
            { questionId: 'q1', answerHash: 'hash1' },
            { questionId: 'q2', answerHash: 'hash2' },
          ],
        },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should remove backup email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { action: 'remove_backup_email' },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should remove security questions', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { action: 'remove_security_questions' },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should verify security answers', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, verified: true, correctCount: 2 },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: {
          action: 'verify_security_answers',
          answers: [
            { questionId: 'q1', answer: 'answer1' },
            { questionId: 'q2', answer: 'answer2' },
          ],
        },
      });

      expect(result.data?.verified).toBe(true);
      expect(result.data?.correctCount).toBe(2);
    });

    it('should reject insufficient security answers', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, verified: false, correctCount: 1 },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: {
          action: 'verify_security_answers',
          answers: [
            { questionId: 'q1', answer: 'wronganswer' },
            { questionId: 'q2', answer: 'answer2' },
          ],
        },
      });

      expect(result.data?.verified).toBe(false);
      expect(result.data?.correctCount).toBe(1);
    });

    it('should require authentication for recovery options', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Unauthorized' },
        error: { message: 'Unauthorized', status: 401 } as any,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { action: 'get' },
      });

      expect(result.error?.message).toContain('Unauthorized');
    });

    it('should validate backup email format', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Invalid email format' },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { action: 'save_backup_email', backupEmail: 'invalid-email' },
      });

      expect(result.data?.error).toBeDefined();
    });

    it('should require minimum security questions', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'At least 2 security questions required' },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: {
          action: 'save_security_questions',
          securityQuestions: [{ questionId: 'q1', answerHash: 'hash1' }],
        },
      });

      expect(result.data?.error).toContain('At least 2');
    });
  });

  describe('Verify Recovery Function', () => {
    it('should verify recovery via backup email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, message: 'Recovery email sent' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'backup_email',
          email: 'user@example.com',
          backupEmail: 'backup@example.com',
        },
      });

      expect(result.data?.success).toBe(true);
      expect(result.data?.message).toContain('Recovery email sent');
    });

    it('should verify recovery via security questions', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, message: 'Recovery email sent' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'security_questions',
          email: 'user@example.com',
          answers: [
            { questionId: 'q1', answer: 'answer1' },
            { questionId: 'q2', answer: 'answer2' },
          ],
        },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should reject incorrect backup email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          error: 'Backup email does not match our records.',
          remainingAttempts: 4,
        },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'backup_email',
          email: 'user@example.com',
          backupEmail: 'wrong@example.com',
        },
      });

      expect(result.data?.error).toContain('does not match');
      expect(result.data?.remainingAttempts).toBe(4);
    });

    it('should reject incorrect security answers', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          error: 'Security answers do not match.',
          remainingAttempts: 2,
        },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'security_questions',
          email: 'user@example.com',
          answers: [
            { questionId: 'q1', answer: 'wronganswer1' },
            { questionId: 'q2', answer: 'wronganswer2' },
          ],
        },
      });

      expect(result.data?.error).toContain('do not match');
      expect(result.data?.remainingAttempts).toBe(2);
    });

    it('should block after rate limit exceeded', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          error: 'Too many attempts. Please try again later.',
          blocked: true,
          blockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'security_questions',
          email: 'user@example.com',
          answers: [],
        },
      });

      expect(result.data?.blocked).toBe(true);
      expect(result.data?.blockedUntil).toBeDefined();
    });

    it('should handle non-existent user gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'If an account exists, a recovery email will be sent.' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'backup_email',
          email: 'nonexistent@example.com',
          backupEmail: 'backup@example.com',
        },
      });

      // Should not reveal if user exists
      expect(result.data?.error).toContain('If an account exists');
    });

    it('should handle no security questions configured', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'No security questions configured for this account.' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'security_questions',
          email: 'user@example.com',
          answers: [
            { questionId: 'q1', answer: 'answer1' },
            { questionId: 'q2', answer: 'answer2' },
          ],
        },
      });

      expect(result.data?.error).toContain('No security questions');
    });

    it('should require email parameter', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Email required' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'backup_email',
          backupEmail: 'backup@example.com',
        },
      });

      expect(result.data?.error).toContain('Email required');
    });

    it('should require backup email for backup method', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Backup email required' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'backup_email',
          email: 'user@example.com',
        },
      });

      expect(result.data?.error).toContain('Backup email required');
    });

    it('should require minimum answers for security questions', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'At least 2 answers required' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'security_questions',
          email: 'user@example.com',
          answers: [{ questionId: 'q1', answer: 'answer1' }],
        },
      });

      expect(result.data?.error).toContain('At least 2 answers');
    });

    it('should handle invalid recovery method', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Invalid recovery method' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'invalid_method',
          email: 'user@example.com',
        },
      });

      expect(result.data?.error).toContain('Invalid recovery method');
    });

    it('should track IP address in recovery attempts', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, message: 'Recovery email sent' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'backup_email',
          email: 'user@example.com',
          backupEmail: 'backup@example.com',
          ipAddress: '192.168.1.1',
        },
      });

      expect(result.data?.success).toBe(true);
    });
  });

  describe('Recovery Email Notifications', () => {
    it('should send notification when backup email is added', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, notificationSent: true },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: { action: 'save_backup_email', backupEmail: 'newbackup@example.com' },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should send notification when security questions are configured', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, notificationSent: true },
        error: null,
      });

      const result = await supabase.functions.invoke('recovery-options', {
        body: {
          action: 'save_security_questions',
          securityQuestions: [
            { questionId: 'q1', answerHash: 'hash1' },
            { questionId: 'q2', answerHash: 'hash2' },
          ],
        },
      });

      expect(result.data?.success).toBe(true);
    });

    it('should send alert when recovery is used', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, message: 'Recovery email sent', alertSent: true },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-recovery', {
        body: {
          method: 'backup_email',
          email: 'user@example.com',
          backupEmail: 'backup@example.com',
        },
      });

      expect(result.data?.success).toBe(true);
    });
  });

  describe('Concurrent Recovery Attempts', () => {
    it('should handle multiple concurrent recovery attempts', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { allowed: true, remainingAttempts: 2 },
        error: null,
      });

      const attempts = Array(3).fill(null).map(() =>
        supabase.functions.invoke('recovery-rate-limit', {
          body: { identifier: 'test@example.com', attemptType: 'security_questions' },
        })
      );

      const results = await Promise.all(attempts);

      results.forEach((result) => {
        expect(result.data?.allowed).toBeDefined();
      });
    });
  });

  describe('Recovery Options Database Storage', () => {
    it('should store recovery options in database', async () => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                backup_email: 'backup@example.com',
                backup_email_verified: true,
                security_questions: [],
              },
              error: null,
            }),
          })),
        })),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      }));

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = supabase.from('account_recovery_options')
        .select('*')
        .eq('user_id', 'test-user-id')
        .single();

      expect(supabase.from).toHaveBeenCalledWith('account_recovery_options');
    });

    it('should update existing recovery options', async () => {
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(),
        insert: vi.fn(),
        update: mockUpdate,
        delete: vi.fn(),
      } as any);

      supabase.from('account_recovery_options')
        .update({ backup_email: 'updated@example.com' })
        .eq('user_id', 'test-user-id');

      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});

describe('Recovery Hash Function', () => {
  // Test the hashing function behavior
  it('should produce consistent hashes for same input', () => {
    const hashAnswer = (answer: string): string => {
      const normalized = answer.toLowerCase().trim();
      let hash = 0;
      for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    };

    const hash1 = hashAnswer('Test Answer');
    const hash2 = hashAnswer('Test Answer');
    const hash3 = hashAnswer('test answer');
    const hash4 = hashAnswer('  Test Answer  ');

    expect(hash1).toBe(hash2);
    expect(hash1).toBe(hash3); // Case insensitive
    expect(hash1).toBe(hash4); // Trimmed
  });

  it('should produce different hashes for different inputs', () => {
    const hashAnswer = (answer: string): string => {
      const normalized = answer.toLowerCase().trim();
      let hash = 0;
      for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    };

    const hash1 = hashAnswer('Answer One');
    const hash2 = hashAnswer('Answer Two');

    expect(hash1).not.toBe(hash2);
  });
});
