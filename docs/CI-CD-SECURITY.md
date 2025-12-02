# CI/CD Security Testing Documentation

## Overview

Automated security testing suite integrated into GitHub Actions CI/CD pipeline, providing continuous security validation and preventing security regressions.

---

## Architecture

### Workflow Structure

```
GitHub Push/PR/Schedule
         ↓
┌────────────────────────────────────────┐
│     Security Scan Workflow             │
├────────────────────────────────────────┤
│  1. Dependency Audit                   │
│  2. Security Linting                   │
│  3. Secret Scanning                    │
│  4. Regression Tests                   │
│  5. Supabase Validation                │
│  6. License Compliance                 │
└────────┬───────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│     Generate Security Report           │
│  • Aggregate results                   │
│  • Create summary                      │
│  • Comment on PR                       │
│  • Upload artifacts                    │
└────────────────────────────────────────┘
```

---

## Workflows

### 1. Security Scan (`security-scan.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Daily at 2 AM UTC
- Manual workflow dispatch

**Jobs:**

#### Dependency Audit
- Runs `npm audit` for vulnerability detection
- Fails on:
  - Any critical vulnerabilities
  - More than 5 high vulnerabilities
- Generates JSON report
- Retention: 30 days

```yaml
npm audit --audit-level=moderate
```

#### Security Linting
- ESLint with security plugins
- Custom security rules configuration
- Detects:
  - Object injection
  - Unsafe regex
  - eval() usage
  - CSRF vulnerabilities
  - Buffer misuse
- Zero-tolerance for security errors

**Checked Patterns:**
```javascript
// Forbidden patterns
dangerouslySetInnerHTML
eval()
new Function()
innerHTML assignments
document.write()
```

#### Secret Scanning
- TruffleHog integration
- Scans full git history
- Detects:
  - API keys
  - Passwords
  - Private keys
  - Access tokens
  - Database credentials
- Only fails on verified secrets

#### Security Regression Tests
- Custom Node.js test suite
- 10 comprehensive security tests
- Tests patterns and configurations
- Generates detailed JSON report

**Test Coverage:**
1. ✅ No `dangerouslySetInnerHTML` usage
2. ✅ No `eval()` usage
3. ✅ PII masking in edge functions
4. ✅ CORS headers present
5. ✅ No hardcoded secrets
6. ✅ Input validation utilities
7. ✅ RLS policies in migrations
8. ✅ Security headers configured
9. ✅ Rate limiting implemented
10. ✅ No raw SQL execution

#### Supabase Security Check
- Validates edge function configuration
- Checks JWT verification settings
- Verifies CORS implementation
- Confirms PII masking usage
- Scans for anti-patterns

**Validation Checks:**
```bash
# JWT verification
grep "verify_jwt = false" supabase/config.toml

# CORS headers
grep -r "corsHeaders" supabase/functions/

# PII masking
grep -r "maskEmail|maskUserInfo" supabase/functions/

# Dangerous patterns
grep -r "dangerouslySetInnerHTML" src/
grep -r "eval(" src/ supabase/functions/
```

#### License Compliance
- Scans all dependencies
- Ensures compatible licenses
- Fails on restrictive licenses (GPL)
- Allowed licenses:
  - MIT
  - Apache-2.0
  - BSD (all variants)
  - ISC
  - CC0-1.0
  - Unlicense

#### Security Report Generation
- Aggregates all job results
- Creates markdown summary
- Comments on pull requests
- Uploads comprehensive report
- Retention: 90 days

---

### 2. Dependency Check (`dependency-check.yml`)

**Triggers:**
- Weekly (Mondays at 3 AM UTC)
- Manual workflow dispatch

**Jobs:**

#### Check Outdated
- Lists outdated packages
- Compares current vs latest versions
- Generates outdated packages report
- Informational only (doesn't fail)

#### Auto-Update Safe
- Updates patch versions automatically
- Runs build verification
- Creates pull request with changes
- Labels: `security`, `dependencies`, `automated`

**Safety Measures:**
```bash
# Only patch updates (1.2.3 → 1.2.4)
npm update --save

# Verify build still works
npm run build || exit 1
```

#### Vulnerability Report
- Comprehensive vulnerability analysis
- Creates GitHub issues for critical findings
- Categorizes by severity
- Tracks over time

**Alert Thresholds:**
```javascript
if (CRITICAL > 0 || HIGH > 0) {
  // Create GitHub issue
  gh issue create --title "🚨 Security Alert" --label "security,critical"
}
```

---

## Security Test Suite

### Running Locally

```bash
# Install dependencies
npm ci

# Run security tests
node scripts/security-tests.js

# Run with npm
npm run security-test  # (if configured)
```

### Test Output

```
============================================================
Security Regression Test Suite
============================================================

✅ PASS: No dangerouslySetInnerHTML usage
✅ PASS: No eval() usage
✅ PASS: PII masking in edge functions
⚠️  WARN: CORS headers in edge functions
✅ PASS: No hardcoded secrets
✅ PASS: Input validation in forms
⚠️  WARN: RLS policies in database
✅ PASS: Security headers function
✅ PASS: Rate limiting implementation
✅ PASS: No raw SQL execution

============================================================
Test Summary
============================================================
✅ Passed: 8
❌ Failed: 0
⚠️  Warnings: 2
============================================================

Results saved to: security-test-results.json
```

### Test Results Schema

```json
{
  "passed": ["test1", "test2", ...],
  "failed": [
    {
      "test": "test_name",
      "reason": "failure reason"
    }
  ],
  "warnings": [
    {
      "test": "test_name",
      "reason": "warning reason"
    }
  ],
  "timestamp": "2025-12-02T00:00:00.000Z"
}
```

---

## ESLint Security Configuration

### Plugins
- `eslint-plugin-security` - Security-specific rules
- `@typescript-eslint/eslint-plugin` - TypeScript security
- `eslint-plugin-react` - React security patterns

### Key Rules

```json
{
  "security/detect-object-injection": "error",
  "security/detect-unsafe-regex": "error",
  "security/detect-eval-with-expression": "error",
  "security/detect-non-literal-regexp": "warn",
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "react/no-danger": "error",
  "react/jsx-no-target-blank": "error"
}
```

---

## Artifacts & Reports

### Generated Artifacts

| Artifact | Retention | Description |
|----------|-----------|-------------|
| npm-audit-results | 30 days | Dependency vulnerabilities |
| eslint-security-results | 30 days | Code security issues |
| security-test-results | 30 days | Regression test results |
| security-summary | 90 days | Comprehensive report |
| vulnerability-report | 90 days | Detailed vuln analysis |
| outdated-packages | 30 days | Outdated dependency list |

### Accessing Artifacts

```bash
# GitHub CLI
gh run download <run-id> -n security-summary

# GitHub Actions UI
Actions → Workflow Run → Artifacts section
```

---

## Pull Request Integration

### Automated PR Comments

When security scan runs on PR, a comment is automatically posted:

```markdown
# Security Scan Summary

**Scan Date:** 2025-12-02 02:00:00 UTC
**Branch:** feature/new-feature
**Commit:** abc123def456

## Job Results
- Dependency Audit: ✅ success
- Security Linting: ✅ success
- Secret Scanning: ✅ success
- Regression Tests: ✅ success
- Supabase Check: ✅ success

## Vulnerability Summary
- CRITICAL: 0
- HIGH: 0
- MODERATE: 2
- LOW: 5
```

### Merge Requirements

Consider requiring security checks to pass before merge:

```yaml
# .github/branch_protection_rules.yml
required_status_checks:
  - Dependency Audit
  - Security Linting
  - Secret Scanning
  - Security Regression Tests
```

---

## Notifications

### GitHub Issues
- Created automatically for critical vulnerabilities
- Labels: `security`, `critical`
- Includes vulnerability count and details

### Failed Workflow Notifications
- GitHub sends email for workflow failures
- Configure in: Settings → Notifications → Actions

---

## Continuous Improvement

### Adding New Tests

1. **Create test function** in `scripts/security-tests.js`:
```javascript
function testNewSecurityCheck() {
  const testName = 'New security check';
  // Test logic here
  if (passed) {
    pass(testName);
  } else {
    fail(testName, reason);
  }
}
```

2. **Add to test runner**:
```javascript
async function runTests() {
  // ... existing tests
  testNewSecurityCheck();
}
```

3. **Test locally**:
```bash
node scripts/security-tests.js
```

### Updating Thresholds

Adjust severity thresholds in workflows:

```yaml
# More strict
if [ "$HIGH" -gt 2 ]; then  # Previously 5

# Less strict  
if [ "$HIGH" -gt 10 ]; then
```

### Adding Dependencies

When adding new npm packages:
1. Security scan runs automatically
2. Review dependency vulnerabilities
3. Check license compatibility
4. Update if needed before merge

---

## Troubleshooting

### Common Issues

**1. Tests fail after dependency update**
```bash
# Check what changed
npm audit
npm outdated

# Review specific package
npm audit <package-name>
```

**2. False positive in secret scanning**
```bash
# Add to .gitignore or allowlist
# Update TruffleHog config if needed
```

**3. ESLint security failures**
```bash
# Run locally to debug
npx eslint . --config .eslintrc.security.json

# Fix automatically where possible
npx eslint . --config .eslintrc.security.json --fix
```

**4. Build fails in auto-update job**
```bash
# Manually test updates
npm update
npm run build

# Check for breaking changes
git diff package-lock.json
```

---

## Best Practices

### For Developers

1. **Run tests locally before pushing**
   ```bash
   node scripts/security-tests.js
   npm audit
   ```

2. **Review security warnings**
   - Don't ignore ESLint security warnings
   - Understand why a pattern is flagged
   - Fix or properly suppress with justification

3. **Keep dependencies updated**
   - Review automated update PRs promptly
   - Test thoroughly before merging
   - Monitor for security advisories

4. **Add tests for new security measures**
   - Implement security feature
   - Add regression test
   - Document in this file

### For Maintainers

1. **Review security reports weekly**
   - Check artifacts from scheduled scans
   - Investigate new vulnerabilities
   - Prioritize critical issues

2. **Respond to security issues**
   - Acknowledge within 24 hours
   - Assess severity and impact
   - Deploy fixes according to timeline

3. **Update workflows as needed**
   - Adjust thresholds based on project needs
   - Add new security tools
   - Keep actions up to date

4. **Document security decisions**
   - Why certain patterns are allowed
   - Risk acceptance rationales
   - Compensating controls

---

## Security Metrics

Track over time:
- Vulnerability count by severity
- Time to fix critical issues
- Test pass rate
- Dependency update frequency
- False positive rate

---

## Resources

### Documentation
- [Security Hardening Guide](./SECURITY-HARDENING.md)
- [Security Review Summary](./SECURITY-REVIEW-SUMMARY.md)
- [GitHub Security Policy](../.github/SECURITY.md)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [GitHub Actions](https://docs.github.com/en/actions)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Snyk Vulnerability Database](https://security.snyk.io/)
- [GitHub Security Advisories](https://github.com/advisories)

---

## Conclusion

This CI/CD security testing suite provides:

✅ **Automated vulnerability detection**  
✅ **Continuous security validation**  
✅ **Regression prevention**  
✅ **Dependency monitoring**  
✅ **Compliance checking**  
✅ **Comprehensive reporting**

The suite runs automatically on every push and pull request, ensuring security is maintained throughout the development lifecycle.

---

**Last Updated:** December 2025  
**Workflow Version:** 1.0  
**Next Review:** March 2026
