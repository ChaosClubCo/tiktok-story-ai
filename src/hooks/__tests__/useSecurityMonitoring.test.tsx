import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Test the security monitoring logic independently
describe('Security Event Types', () => {
  const eventTypes = [
    'auth_success',
    'auth_failure', 
    'rate_limit',
    'suspicious_activity',
    'admin_action',
    'csrf_attempt',
  ];

  const severityLevels = ['info', 'warn', 'high', 'critical'];

  it('should have valid event types', () => {
    eventTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);
    });
  });

  it('should have valid severity levels', () => {
    severityLevels.forEach(level => {
      expect(typeof level).toBe('string');
    });
  });
});

describe('Rate Limit Severity Calculation', () => {
  const getSeverity = (attempts: number): 'info' | 'warn' | 'high' | 'critical' => {
    if (attempts >= 15) return 'critical';
    if (attempts >= 10) return 'high';
    if (attempts >= 5) return 'warn';
    return 'info';
  };

  it('should return info for low attempts', () => {
    expect(getSeverity(1)).toBe('info');
    expect(getSeverity(4)).toBe('info');
  });

  it('should return warn for moderate attempts', () => {
    expect(getSeverity(5)).toBe('warn');
    expect(getSeverity(9)).toBe('warn');
  });

  it('should return high for elevated attempts', () => {
    expect(getSeverity(10)).toBe('high');
    expect(getSeverity(14)).toBe('high');
  });

  it('should return critical for excessive attempts', () => {
    expect(getSeverity(15)).toBe('critical');
    expect(getSeverity(100)).toBe('critical');
  });
});

describe('Auth Monitoring Logic', () => {
  interface AuthAttempt {
    email: string;
    success: boolean;
    timestamp: Date;
  }

  const analyzeAuthAttempts = (attempts: AuthAttempt[]) => {
    const failures = attempts.filter(a => !a.success);
    const successes = attempts.filter(a => a.success);
    
    return {
      totalAttempts: attempts.length,
      successCount: successes.length,
      failureCount: failures.length,
      failureRate: attempts.length > 0 ? failures.length / attempts.length : 0,
      isAnomalous: failures.length >= 3,
    };
  };

  it('should count successes and failures', () => {
    const attempts: AuthAttempt[] = [
      { email: 'user@test.com', success: true, timestamp: new Date() },
      { email: 'user@test.com', success: false, timestamp: new Date() },
      { email: 'user@test.com', success: true, timestamp: new Date() },
    ];
    
    const result = analyzeAuthAttempts(attempts);
    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(1);
  });

  it('should calculate failure rate', () => {
    const attempts: AuthAttempt[] = [
      { email: 'user@test.com', success: false, timestamp: new Date() },
      { email: 'user@test.com', success: false, timestamp: new Date() },
      { email: 'user@test.com', success: true, timestamp: new Date() },
      { email: 'user@test.com', success: true, timestamp: new Date() },
    ];
    
    const result = analyzeAuthAttempts(attempts);
    expect(result.failureRate).toBe(0.5);
  });

  it('should detect anomalous behavior', () => {
    const normalAttempts: AuthAttempt[] = [
      { email: 'user@test.com', success: false, timestamp: new Date() },
      { email: 'user@test.com', success: true, timestamp: new Date() },
    ];
    expect(analyzeAuthAttempts(normalAttempts).isAnomalous).toBe(false);

    const anomalousAttempts: AuthAttempt[] = [
      { email: 'user@test.com', success: false, timestamp: new Date() },
      { email: 'user@test.com', success: false, timestamp: new Date() },
      { email: 'user@test.com', success: false, timestamp: new Date() },
    ];
    expect(analyzeAuthAttempts(anomalousAttempts).isAnomalous).toBe(true);
  });

  it('should handle empty attempts', () => {
    const result = analyzeAuthAttempts([]);
    expect(result.totalAttempts).toBe(0);
    expect(result.failureRate).toBe(0);
    expect(result.isAnomalous).toBe(false);
  });
});

describe('CSRF Detection Logic', () => {
  const isSuspiciousCsrf = (
    url: string,
    method: string,
    hasClientInfo: boolean
  ): boolean => {
    const isSupabaseUrl = url.includes('supabase.co');
    const isNonGetRequest = method.toUpperCase() !== 'GET';
    
    return isSupabaseUrl && isNonGetRequest && !hasClientInfo;
  };

  it('should detect suspicious POST without client info', () => {
    expect(isSuspiciousCsrf('https://abc.supabase.co/rest', 'POST', false)).toBe(true);
  });

  it('should not flag GET requests', () => {
    expect(isSuspiciousCsrf('https://abc.supabase.co/rest', 'GET', false)).toBe(false);
  });

  it('should not flag requests with client info', () => {
    expect(isSuspiciousCsrf('https://abc.supabase.co/rest', 'POST', true)).toBe(false);
  });

  it('should not flag non-Supabase URLs', () => {
    expect(isSuspiciousCsrf('https://other-api.com/data', 'POST', false)).toBe(false);
  });

  it('should handle different HTTP methods', () => {
    expect(isSuspiciousCsrf('https://abc.supabase.co/rest', 'PUT', false)).toBe(true);
    expect(isSuspiciousCsrf('https://abc.supabase.co/rest', 'DELETE', false)).toBe(true);
    expect(isSuspiciousCsrf('https://abc.supabase.co/rest', 'PATCH', false)).toBe(true);
  });
});

describe('PII Masking for Security Logs', () => {
  const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return '***@***.***';
    const [localPart, domain] = email.split('@');
    return `${localPart[0]}***@${domain}`;
  };

  const truncateUserId = (userId: string): string => {
    return userId.length > 8 ? `${userId.slice(0, 8)}...` : userId;
  };

  it('should mask email correctly', () => {
    expect(maskEmail('john.doe@example.com')).toBe('j***@example.com');
    expect(maskEmail('a@test.com')).toBe('a***@test.com');
  });

  it('should handle invalid emails', () => {
    expect(maskEmail('')).toBe('***@***.***');
    expect(maskEmail('notanemail')).toBe('***@***.***');
  });

  it('should truncate user ID', () => {
    expect(truncateUserId('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400...');
    expect(truncateUserId('short')).toBe('short');
  });
});

describe('Admin Action Logging', () => {
  interface AdminAction {
    userId: string;
    action: string;
    resource: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  }

  const formatAdminAction = (action: AdminAction): string => {
    return `[${action.timestamp.toISOString()}] User ${action.userId}: ${action.action} on ${action.resource}`;
  };

  it('should format admin action correctly', () => {
    const action: AdminAction = {
      userId: 'admin-123',
      action: 'UPDATE',
      resource: 'user-456',
      timestamp: new Date('2026-01-10T12:00:00Z'),
    };
    
    const formatted = formatAdminAction(action);
    expect(formatted).toContain('admin-123');
    expect(formatted).toContain('UPDATE');
    expect(formatted).toContain('user-456');
    expect(formatted).toContain('2026-01-10');
  });
});
