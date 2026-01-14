# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| develop | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: [security@minidrama.app] (to be configured)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 24 hours
- **Initial Assessment:** Within 48 hours
- **Fix Timeline:** Based on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Within 90 days

## Security Measures

### Authentication & Authorization
- Multi-layer admin route protection
- Server-side JWT verification
- Row-Level Security (RLS) on all database tables
- Password strength requirements enforced

### Data Protection
- GDPR/CCPA compliant PII masking
- Encrypted data in transit (HTTPS/TLS)
- Encrypted data at rest (Supabase)
- Audit logging for admin actions

### Input Validation
- Zod schema validation on all forms
- Server-side input sanitization
- XSS prevention measures
- SQL injection prevention

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

### Rate Limiting
- IP-based rate limiting on public endpoints
- Configurable per-endpoint limits
- Automatic cleanup of old entries

### Monitoring
- Real-time security event tracking
- Failed authentication monitoring
- Suspicious activity detection
- CSRF attempt detection

## Automated Security Testing

### CI/CD Pipeline
- Dependency vulnerability scanning (npm audit)
- Secret detection (TruffleHog)
- Security-focused linting (ESLint)
- License compliance checking
- Supabase configuration validation
- Security regression tests

### Scheduled Scans
- Daily security scans at 2 AM UTC
- Weekly dependency updates (Mondays)
- Automated PR creation for safe updates
- Vulnerability reports for critical issues

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use environment variables
   - Store secrets in Supabase/GitHub Secrets
   - Use `.env` for local development (gitignored)

2. **Input validation**
   - Validate all user inputs client and server-side
   - Use Zod schemas for type-safe validation
   - Sanitize data before rendering

3. **Authentication**
   - Always verify JWT tokens server-side
   - Use RLS policies for data access control
   - Never trust client-side checks alone

4. **Logging**
   - Mask PII in all logs
   - Use structured logging
   - Include context but not sensitive data

5. **Dependencies**
   - Keep dependencies updated
   - Review security advisories
   - Use `npm audit` regularly

### For Administrators

1. **Access Control**
   - Use strong passwords
   - Enable 2FA (when available)
   - Review admin access regularly
   - Audit admin actions

2. **Monitoring**
   - Review security event logs weekly
   - Investigate failed authentication attempts
   - Monitor rate limit violations
   - Check for suspicious patterns

3. **Incident Response**
   - Have a response plan ready
   - Document incidents
   - Update security measures
   - Communicate with stakeholders

## Security Documentation

- [Security Hardening Guide](../docs/SECURITY-HARDENING.md)
- [Security Review Summary](../docs/SECURITY-REVIEW-SUMMARY.md)
- [Security Improvements Log](../docs/SECURITY-IMPROVEMENTS-2025-11-26.md)

## Compliance

### GDPR
- PII masking in logs
- Data minimization
- Right to deletion
- Data access controls

### CCPA
- PII protection measures
- Security safeguards
- Data breach notifications
- Consumer rights support

### OWASP Top 10
All OWASP Top 10 (2021) vulnerabilities addressed:
- Broken Access Control
- Cryptographic Failures
- Injection
- Insecure Design
- Security Misconfiguration
- Vulnerable Components
- Authentication Failures
- Data Integrity Failures
- Logging Failures
- SSRF

## Security Updates

Security updates are deployed through:
1. Automated dependency updates (patch versions)
2. Manual security patches (reviewed and tested)
3. Emergency hotfixes (critical vulnerabilities)

Users are notified of critical security updates via:
- GitHub release notes
- Email notifications (if configured)
- In-app notifications (for critical issues)

## Contact

For security-related questions or concerns:
- Security Team: [security@minidrama.app]
- General Support: [support@minidrama.app]

---

**Last Updated:** December 2025  
**Next Review:** March 2026
