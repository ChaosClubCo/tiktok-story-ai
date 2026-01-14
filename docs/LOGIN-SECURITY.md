# Login Security System

This document describes the login rate limiting and brute-force protection system implemented in the MiniDrama platform.

## Overview

The login security system protects against brute-force attacks by implementing progressive rate limiting with CAPTCHA challenges and IP-based blocking. This follows OWASP and NIST security guidelines.

## Rate Limiting Configuration

| Failed Attempts | Action                        | Duration    |
|-----------------|-------------------------------|-------------|
| 1-2             | Allow with warning            | -           |
| 3+              | Require CAPTCHA               | -           |
| 8+              | Block IP (after CAPTCHA)      | 15 minutes  |
| 15+             | Extended block                | 1 hour      |
| 25+             | Maximum block                 | 24 hours    |

**Window**: Rate limit counters reset after 15 minutes of no failed attempts.

## Architecture

### Database Schema

#### `login_rate_limits` Table

```sql
CREATE TABLE login_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  failed_attempts INTEGER DEFAULT 0,
  first_failed_at TIMESTAMPTZ,
  blocked_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Edge Function: `login-rate-limit`

The edge function handles three actions:

#### 1. `check` - Check Rate Limit Status

```typescript
// Request
{
  "action": "check"
}

// Response (allowed)
{
  "allowed": true,
  "blocked": false,
  "remainingAttempts": 5,
  "requiresCaptcha": false,
  "captchaAttemptsRemaining": 3
}

// Response (blocked)
{
  "allowed": false,
  "blocked": true,
  "blockedUntil": "2025-01-10T12:30:00Z",
  "retryAfterSeconds": 900,
  "message": "Too many failed login attempts. Please try again in 15 minutes."
}
```

#### 2. `record_attempt` - Record Login Attempt

```typescript
// Request (failed attempt)
{
  "action": "record_attempt",
  "success": false,
  "captchaSolved": false
}

// Request (successful login)
{
  "action": "record_attempt",
  "success": true
}

// Response includes updated rate limit state
```

#### 3. `reset` - Manual Reset (Admin)

```typescript
// Request
{
  "action": "reset"
}
```

## Frontend Integration

### `useLoginRateLimit` Hook

```tsx
import { useLoginRateLimit } from '@/hooks/useLoginRateLimit';

function LoginForm() {
  const {
    isBlocked,
    blockedUntil,
    remainingAttempts,
    retryAfterSeconds,
    warningMessage,
    requiresCaptcha,
    captchaAttemptsRemaining,
    checkRateLimit,
    recordAttempt,
    formatTimeRemaining,
    reset
  } = useLoginRateLimit();

  const handleLogin = async () => {
    // Check rate limit before attempting login
    const allowed = await checkRateLimit();
    if (!allowed) {
      return; // User is blocked
    }

    try {
      // Attempt login
      const result = await signIn(email, password);
      
      // Record successful attempt
      await recordAttempt(true);
    } catch (error) {
      // Record failed attempt
      await recordAttempt(false, captchaSolved);
    }
  };

  if (isBlocked) {
    return (
      <div>
        <p>Account locked. Try again in {formatTimeRemaining()}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
      {requiresCaptcha && <CaptchaWidget />}
      {warningMessage && <p>{warningMessage}</p>}
    </form>
  );
}
```

### Hook State Properties

| Property | Type | Description |
|----------|------|-------------|
| `isBlocked` | `boolean` | Whether the IP is currently blocked |
| `blockedUntil` | `Date \| null` | When the block expires |
| `remainingAttempts` | `number \| null` | Attempts before next block level |
| `retryAfterSeconds` | `number` | Seconds until block expires |
| `warningMessage` | `string \| null` | Warning to display to user |
| `requiresCaptcha` | `boolean` | Whether CAPTCHA is required |
| `captchaAttemptsRemaining` | `number \| null` | Attempts before lockout |

### Hook Methods

| Method | Description |
|--------|-------------|
| `checkRateLimit()` | Check if login is allowed |
| `recordAttempt(success, captchaSolved?)` | Record login attempt result |
| `formatTimeRemaining()` | Format countdown string |
| `reset()` | Reset local state |

## CAPTCHA Flow

1. User enters credentials and submits
2. Hook calls `checkRateLimit()` to check status
3. If `requiresCaptcha` is true, display CAPTCHA widget
4. User solves CAPTCHA before submitting
5. On failed login, call `recordAttempt(false, captchaSolved)`
6. System tracks that CAPTCHA was solved when calculating blocks

## Security Features

### IP Detection

The system uses multiple headers to detect client IP:

```typescript
const ipAddress = 
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
  req.headers.get('cf-connecting-ip') || 
  req.headers.get('x-real-ip') ||
  '0.0.0.0';
```

### Automatic Countdown

The hook includes a built-in countdown timer that:
- Updates `retryAfterSeconds` every second
- Automatically clears blocked state when timer expires
- Cleans up intervals on component unmount

### Audit Logging

All login attempts are logged to the `login_activity` table:

```sql
INSERT INTO login_activity (
  user_id,
  ip_address,
  user_agent,
  success,
  failure_reason
)
```

### Security Alerts

When an IP is blocked, the system triggers a security alert email:

```typescript
fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
  method: 'POST',
  body: JSON.stringify({
    alertType: 'login_blocked',
    ipAddress,
    failedAttempts,
    blockedUntil
  })
});
```

## Best Practices

1. **Always check rate limit before login** - Call `checkRateLimit()` on form load
2. **Record all attempts** - Both success and failure should be recorded
3. **Show clear feedback** - Display `warningMessage` to users
4. **Implement CAPTCHA** - Integrate a CAPTCHA widget when `requiresCaptcha` is true
5. **Handle blocked state gracefully** - Show countdown timer with `formatTimeRemaining()`

## Database Maintenance

A scheduled job should clean up expired rate limit records:

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM login_rate_limits
  WHERE blocked_until IS NOT NULL 
    AND blocked_until < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

## Related Documentation

- [Security Alerts](./SECURITY-ALERTS.md)
- [Security Hardening](./SECURITY-HARDENING.md)
- [Architecture](./ARCHITECTURE.md)
