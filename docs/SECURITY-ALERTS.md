# Security Alerts System

This document describes the security alert email system that notifies users of security-related events on their accounts.

## Overview

The security alerts system sends real-time email notifications to users when security-sensitive actions occur. This helps users detect unauthorized access and respond quickly to potential threats.

## Alert Types

| Alert Type | Trigger | Severity |
|------------|---------|----------|
| `login_blocked` | IP blocked due to failed login attempts | High |
| `password_changed` | User changed their password | Medium |
| `2fa_enabled` | Two-factor authentication enabled | Low (Informational) |
| `2fa_disabled` | Two-factor authentication disabled | High |
| `suspicious_activity` | Unusual account activity detected | High |

## Architecture

### Database Schema

#### `security_alerts` Table

```sql
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  alert_type TEXT NOT NULL,
  ip_address INET,
  metadata JSONB,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Edge Function: `send-security-alert`

The edge function handles sending security alert emails:

#### Request Format

```typescript
interface SecurityAlertRequest {
  userId: string;
  alertType: 'login_blocked' | '2fa_enabled' | '2fa_disabled' | 
             'suspicious_activity' | 'password_changed';
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  failedAttempts?: number;
  blockedUntil?: string;
}
```

#### Example Usage

```typescript
// From client-side code
await supabase.functions.invoke('send-security-alert', {
  body: {
    userId: user.id,
    alertType: 'password_changed',
    ipAddress: '192.168.1.1',
    userAgent: navigator.userAgent
  }
});

// From another edge function
fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`
  },
  body: JSON.stringify({
    userId: userId,
    alertType: 'login_blocked',
    failedAttempts: 10,
    blockedUntil: '2025-01-10T13:00:00Z'
  })
});
```

## Email Templates

### Login Blocked

Subject: `🚨 Security Alert: Your account login was blocked`

Content includes:
- Warning about blocked login attempts
- Number of failed attempts
- IP address and location
- Device information
- Timestamp
- Block duration
- Recommended actions

### Password Changed

Subject: `🔑 Your Password Was Changed`

Content includes:
- Confirmation of password change
- IP address and device info
- Timestamp
- Warning if not recognized

### 2FA Enabled

Subject: `🔐 Two-Factor Authentication Enabled`

Content includes:
- Confirmation message
- Reminder about backup codes
- Device information
- Timestamp

### 2FA Disabled

Subject: `⚠️ Security Alert: Two-Factor Authentication Disabled`

Content includes:
- Warning about reduced security
- Recommendation to re-enable
- Device information
- Timestamp
- Warning if not recognized

### Suspicious Activity

Subject: `🚨 Suspicious Activity Detected on Your Account`

Content includes:
- Alert about unusual activity
- IP address and location
- Device information
- Recommended immediate actions

## Email Delivery

### Resend API Integration

The system uses Resend for email delivery:

```typescript
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

await resend.emails.send({
  from: "MiniDrama Security <onboarding@resend.dev>",
  to: [userEmail],
  subject: getAlertSubject(alertType),
  html: getAlertHtml(alertType, data)
});
```

### Configuration Requirements

The following environment variable must be set:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | API key from Resend dashboard |

### Production Setup

For production, update the `from` address to use your verified domain:

```typescript
from: "Security <security@yourdomain.com>"
```

## Frontend Integration

### Triggering Password Change Alerts

```tsx
// In PasswordChange.tsx
const handleSubmit = async (data: FormData) => {
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword
  });

  if (!error) {
    // Send security alert
    await supabase.functions.invoke('send-security-alert', {
      body: {
        userId: user.id,
        alertType: 'password_changed'
      }
    });
  }
};
```

### Viewing Alert History

The `SecurityAlertsHistory` component displays past alerts:

```tsx
import { SecurityAlertsHistory } from '@/components/settings/SecurityAlertsHistory';

// In Settings page
<TabsContent value="security">
  <SecurityAlertsHistory />
</TabsContent>
```

## Audit Logging

All security alerts are also logged to `admin_audit_log`:

```typescript
await supabase.from("admin_audit_log").insert({
  admin_id: userId,
  action: `security_alert_${alertType}`,
  resource_type: "security_alert",
  metadata: {
    ip_address: ipAddress,
    user_agent: userAgent,
    email_sent: true
  }
});
```

## Error Handling

The edge function handles errors gracefully:

1. **User Not Found** - Returns 500 with error message
2. **Email Send Failure** - Alert is still logged to database
3. **Database Insert Failure** - Error is logged, email still attempted

```typescript
try {
  // Send email
  const emailResponse = await resend.emails.send({...});
  
  // Update alert as sent
  await supabase.from("security_alerts")
    .update({ email_sent: true })
    .eq("user_id", userId)
    .eq("alert_type", alertType);
} catch (error) {
  console.error("Email send failed:", error);
}
```

## Integration Points

### Login Rate Limiting

The `login-rate-limit` function triggers alerts when IPs are blocked:

```typescript
if (blockedUntil) {
  fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
    body: JSON.stringify({
      alertType: 'login_blocked',
      failedAttempts,
      blockedUntil
    })
  });
}
```

### Two-Factor Authentication

The `user-2fa` function triggers alerts on 2FA changes:

```typescript
// On 2FA enable
await sendSecurityAlert(userId, '2fa_enabled');

// On 2FA disable
await sendSecurityAlert(userId, '2fa_disabled');
```

### Password Changes

The Settings page triggers alerts on password updates:

```typescript
// After successful password change
await supabase.functions.invoke('send-security-alert', {
  body: {
    userId: user.id,
    alertType: 'password_changed'
  }
});
```

## Security Considerations

1. **PII Masking** - Email addresses are masked in logs
2. **Rate Limiting** - Consider rate limiting alert emails per user
3. **Email Verification** - Only send to verified email addresses
4. **Sensitive Data** - Never include passwords or tokens in emails

## Related Documentation

- [Login Security](./LOGIN-SECURITY.md)
- [Security Hardening](./SECURITY-HARDENING.md)
- [Architecture](./ARCHITECTURE.md)
