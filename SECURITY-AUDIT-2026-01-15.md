# Security Audit Report

**Date:** 2026-01-15
**Auditor:** Claude Code Security Audit
**Scope:** Full codebase security review

---

## Executive Summary

This security audit identified **8 vulnerabilities** across the MiniDrama AI codebase. While the application demonstrates strong security practices in many areas (100% RLS coverage, PII masking, authentication patterns), several issues require immediate attention.

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 2 | Requires immediate fix |
| High | 3 | Fix within 1 sprint |
| Medium | 2 | Plan for upcoming release |
| Low | 1 | Accepted risk / minor |

---

## Critical Vulnerabilities

### 1. CORS Wildcard Allows Cross-Origin Attacks

**Severity:** CRITICAL
**Location:** `supabase/functions/_shared/corsHeaders.ts:5`
**Also in:** Multiple edge functions (`generate-script/index.ts:9`, `create-checkout/index.ts:7`, etc.)

**Issue:**
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // VULNERABLE
  ...
};
```

**Risk:** The wildcard `*` CORS policy allows ANY website to make authenticated requests to your API. An attacker could:
- Create a malicious website that steals user data when victims visit it
- Perform actions on behalf of authenticated users (CSRF-like attacks)
- Exfiltrate sensitive script content, subscription data, etc.

**Recommendation:**
```typescript
// Replace with explicit origin whitelist
const ALLOWED_ORIGINS = [
  'https://minidrama.com',
  'https://app.minidrama.com',
  process.env.VITE_APP_URL,
].filter(Boolean);

export function getCorsHeaders(requestOrigin: string | null) {
  const origin = ALLOWED_ORIGINS.includes(requestOrigin || '')
    ? requestOrigin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    ...
  };
}
```

---

### 2. Open Redirect via Unvalidated Origin Header

**Severity:** CRITICAL
**Location:** `supabase/functions/create-checkout/index.ts:144-145`

**Issue:**
```typescript
success_url: `${req.headers.get("origin")}/`,
cancel_url: `${req.headers.get("origin")}/`,
```

**Risk:** The `Origin` header is attacker-controlled. A malicious actor can:
1. Craft a request with `Origin: https://evil.com`
2. User completes Stripe checkout
3. User is redirected to `https://evil.com/` instead of the legitimate site
4. Attacker can phish credentials or steal session tokens

**Recommendation:**
```typescript
const ALLOWED_ORIGINS = ['https://minidrama.com', 'https://app.minidrama.com'];
const requestOrigin = req.headers.get("origin");
const safeOrigin = ALLOWED_ORIGINS.includes(requestOrigin)
  ? requestOrigin
  : 'https://minidrama.com';

success_url: `${safeOrigin}/`,
cancel_url: `${safeOrigin}/`,
```

---

## High Severity Vulnerabilities

### 3. Hardcoded Credentials in Source Code

**Severity:** HIGH
**Location:** `src/integrations/supabase/client.ts:5-6`

**Issue:**
```typescript
const SUPABASE_URL = "https://aughkdwuvkgigczkfozp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1...";
```

**Risk:** While anon keys are designed to be public, hardcoding credentials:
- Makes key rotation difficult
- Exposes project structure in version history
- Is a security anti-pattern that may lead to accidental secret exposure

**Recommendation:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase configuration');
}
```

---

### 4. .env File Not in .gitignore

**Severity:** HIGH
**Location:** `.gitignore` (missing entry)

**Issue:** The `.env` file is NOT excluded from git. Current `.gitignore` contents:
```
node_modules
dist
...
# Missing: .env, .env.local, .env.*.local
```

**Risk:** Environment files containing credentials can be accidentally committed to version control, exposing them in git history permanently.

**Recommendation:**
Add to `.gitignore`:
```
.env
.env.local
.env.*.local
.env.production
```

---

### 5. In-Memory Rate Limiting Ineffective in Serverless

**Severity:** HIGH
**Location:** `supabase/functions/_shared/rateLimit.ts:9`

**Issue:**
```typescript
const rateLimitStore = new Map<string, RateLimitEntry>();
```

**Risk:** Edge Functions are serverless and may run on different instances. In-memory rate limiting:
- Resets on cold starts
- Doesn't share state across instances
- Can be bypassed by distributing requests

**Recommendation:** Use a persistent store:
```typescript
// Option 1: Supabase table
const { data, error } = await supabase
  .from('rate_limits')
  .upsert({ key: identifier, count: 1, expires_at: resetTime })
  .select();

// Option 2: Upstash Redis
import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_URL, token: process.env.UPSTASH_TOKEN });
await redis.incr(`ratelimit:${identifier}`);
```

---

## Medium Severity Vulnerabilities

### 6. Content Filter Bypass via Unicode/Encoding

**Severity:** MEDIUM
**Location:** `supabase/functions/generate-script/index.ts:93-119`

**Issue:**
```typescript
const PROHIBITED_CONTENT = {
  selfHarm: ['suicide', 'cutting', 'self-harm', 'kill myself'],
  ...
};
const allInputs = [niche, tone, topic || ''].join(' ').toLowerCase();
if (keywords.some(keyword => allInputs.includes(keyword))) {
  // blocked
}
```

**Risk:** Simple substring matching can be bypassed:
- Unicode homoglyphs: `suıcıde` (Turkish dotless i)
- Leetspeak: `su1c1de`
- Spacing: `s u i c i d e`
- Zero-width characters: `sui​cide`

**Recommendation:**
```typescript
// Normalize unicode before checking
import { normalize } from 'unorm';

function normalizeText(text: string): string {
  return normalize('NFKC', text)
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width
    .replace(/[0-9]/g, c => 'oizeasgtb'[parseInt(c)] || c) // Leetspeak
    .toLowerCase();
}
```

---

### 7. Error Message Information Disclosure

**Severity:** MEDIUM
**Locations:**
- `supabase/functions/delete-account/index.ts:110`
- `supabase/functions/fetch-trends/index.ts:158`
- `supabase/functions/create-checkout/index.ts:157`

**Issue:**
```typescript
return new Response(JSON.stringify({ error: error.message }), ...);
```

**Risk:** Raw error messages can expose:
- Internal system paths
- Database schema information
- Third-party service details
- Stack traces

**Recommendation:**
```typescript
// Use generic error messages
const publicError = getPublicErrorMessage(error);
return new Response(JSON.stringify({ error: publicError }), ...);

function getPublicErrorMessage(error: Error): string {
  // Log full error internally
  console.error('[INTERNAL]', error);

  // Return generic message
  return 'An error occurred. Please try again or contact support.';
}
```

---

## Low Severity Issues

### 8. XSS Sanitization Uses Denylist Approach

**Severity:** LOW
**Location:** `src/lib/sanitization.ts:7-15`

**Issue:**
```typescript
const XSS_PATTERNS = [
  /javascript:/gi,
  /data:/gi,
  // ... denylist patterns
];
```

**Risk:** Denylist-based sanitization can be bypassed by novel attack vectors not in the list. However, combined with React's default escaping, the actual risk is low.

**Recommendation:** Consider using a well-maintained library:
```typescript
import DOMPurify from 'dompurify';
export const sanitizeHtml = (input: string) => DOMPurify.sanitize(input);
```

---

## Security Strengths Observed

The codebase demonstrates several strong security practices:

1. **100% Row-Level Security (RLS)** - All database tables have RLS policies
2. **PII Masking** - Proper masking in logs via `piiMasking.ts`
3. **AES-256-GCM Encryption** - Strong encryption for sensitive data with 100k PBKDF2 iterations
4. **No XSS Vectors** - No `dangerouslySetInnerHTML` or `eval()` usage
5. **Authentication Flow** - Proper JWT validation, rate limiting on auth endpoints
6. **Audit Logging** - Comprehensive admin action logging
7. **Input Validation** - Zod schemas for form validation
8. **Secure Dependencies** - No known vulnerable packages detected

---

## Remediation Priority

| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | Fix CORS wildcard | 2 hours |
| P0 | Validate redirect origins | 1 hour |
| P1 | Add .env to .gitignore | 5 minutes |
| P1 | Use env vars for credentials | 30 minutes |
| P1 | Implement distributed rate limiting | 4 hours |
| P2 | Improve content filtering | 2 hours |
| P2 | Sanitize error messages | 2 hours |
| P3 | Switch to DOMPurify | 1 hour |

---

## Conclusion

The MiniDrama AI application has a solid security foundation with proper authentication, RLS coverage, and encryption. The critical issues identified (CORS and open redirect) should be addressed immediately before production deployment. The remaining issues should be prioritized based on the remediation table above.

**Overall Security Posture:** MODERATE (Requires fixes before production)

---

*Report generated by automated security audit. Manual penetration testing recommended before production launch.*
