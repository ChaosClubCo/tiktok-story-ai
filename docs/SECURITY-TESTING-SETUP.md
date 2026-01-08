# Security Testing Setup Guide

Quick start guide for running automated security tests locally and understanding the CI/CD security pipeline.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or compatible package manager
- Git
- GitHub repository connected

### Installation

```bash
# Install all dependencies (includes security tools)
npm ci

# Verify security tools installed
npx eslint --version
npx license-checker --version
```

---

## 🧪 Running Tests Locally

### Full Security Suite
```bash
# Run all security tests
node scripts/security-tests.js

# Expected output:
# ✅ PASS: No dangerouslySetInnerHTML usage
# ✅ PASS: No eval() usage
# ✅ PASS: PII masking in edge functions
# ...
```

### Dependency Vulnerability Scan
```bash
# Quick audit
npm audit

# Detailed JSON report
npm audit --json > audit-results.json

# Fix automatically (when possible)
npm audit fix
```

### Security-Focused Linting
```bash
# Run ESLint with security rules
npx eslint . --config .eslintrc.security.json

# Auto-fix issues
npx eslint . --config .eslintrc.security.json --fix

# Check specific file
npx eslint src/pages/Auth.tsx --config .eslintrc.security.json
```

### License Compliance Check
```bash
# View all licenses
npx license-checker --summary

# Detailed report
npx license-checker --json > licenses.json

# Check for restrictive licenses
npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD;ISC'
```

### Secret Scanning (Local)
```bash
# Install TruffleHog
brew install trufflesecurity/trufflehog/trufflehog  # macOS
# OR
docker pull trufflesecurity/trufflehog:latest

# Scan repository
trufflehog filesystem . --only-verified

# Scan git history
trufflehog git file://. --only-verified
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflows

All workflows are located in `.github/workflows/`:

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Security Scan | `security-scan.yml` | Push, PR, Daily | Comprehensive security validation |
| Dependency Check | `dependency-check.yml` | Weekly | Dependency updates and vuln monitoring |

### Automatic Execution

**On Every Push/PR:**
1. Dependency audit (fails on critical vulns)
2. Security linting (fails on security errors)
3. Secret scanning (fails on verified secrets)
4. Regression tests (fails on security pattern violations)
5. Supabase validation (warns on misconfigurations)
6. License compliance (fails on restrictive licenses)

**Daily Schedule (2 AM UTC):**
- Full security scan runs automatically
- Results uploaded as artifacts
- Issues created for critical findings

**Weekly Schedule (Mondays 3 AM UTC):**
- Dependency update check
- Auto-create PR for patch updates
- Vulnerability report generation

### Viewing Results

**In GitHub Actions:**
```
Repository → Actions → Select Workflow Run → Artifacts
```

**Via GitHub CLI:**
```bash
# List recent runs
gh run list --workflow=security-scan.yml

# Download artifacts
gh run download <run-id> -n security-summary

# View logs
gh run view <run-id> --log
```

---

## 📊 Understanding Test Results

### Security Test Output

```json
{
  "passed": [
    "No dangerouslySetInnerHTML usage",
    "No eval() usage",
    "PII masking in edge functions"
  ],
  "failed": [
    {
      "test": "No hardcoded secrets",
      "reason": "Potential secrets found:\n  src/config.ts:42"
    }
  ],
  "warnings": [
    {
      "test": "CORS headers in edge functions",
      "reason": "Missing CORS headers in: new-function"
    }
  ],
  "timestamp": "2025-12-02T00:00:00.000Z"
}
```

### NPM Audit Results

```json
{
  "metadata": {
    "vulnerabilities": {
      "critical": 0,
      "high": 1,
      "moderate": 3,
      "low": 5
    },
    "dependencies": 1247,
    "devDependencies": 89
  }
}
```

### ESLint Security Output

```json
[
  {
    "filePath": "/path/to/file.ts",
    "errorCount": 1,
    "messages": [
      {
        "ruleId": "security/detect-object-injection",
        "severity": 2,
        "message": "Variable property access detected",
        "line": 42
      }
    ]
  }
]
```

---

## 🛠️ Configuration

### Adjusting Severity Thresholds

Edit `.github/workflows/security-scan.yml`:

```yaml
# Current: Fail on any critical, >5 high
if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 5 ]; then
  exit 1
fi

# More strict: Fail on any high
if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
  exit 1
fi

# Less strict: Only fail on critical
if [ "$CRITICAL" -gt 0 ]; then
  exit 1
fi
```

### Adding Custom Security Tests

1. **Edit** `scripts/security-tests.js`:
```javascript
function testCustomPattern() {
  const testName = 'Custom security check';
  const pattern = /dangerous-pattern/;
  const matches = searchInDirectory('src', pattern);
  
  if (matches.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Found ${matches.length} violations`);
  }
}
```

2. **Add to runner**:
```javascript
async function runTests() {
  // ... existing tests
  testCustomPattern();  // Add here
}
```

3. **Test locally**:
```bash
node scripts/security-tests.js
```

### Customizing ESLint Rules

Edit `.eslintrc.security.json`:

```json
{
  "rules": {
    // Make rule more strict
    "security/detect-non-literal-fs-filename": "error",  // was "warn"
    
    // Disable rule (with justification)
    "security/detect-object-injection": "off",
    
    // Custom configuration
    "react/jsx-no-target-blank": ["error", {
      "enforceDynamicLinks": "always",
      "warnOnSpreadAttributes": true
    }]
  }
}
```

---

## 🔍 Troubleshooting

### Issue: Tests Pass Locally but Fail in CI

**Possible Causes:**
1. Environment differences
2. Dependency version mismatch
3. Missing files in git

**Solutions:**
```bash
# Ensure clean install
rm -rf node_modules package-lock.json
npm ci

# Check git status
git status --ignored

# Run tests exactly as CI does
CI=true node scripts/security-tests.js
```

### Issue: Too Many False Positives

**For ESLint:**
```javascript
// Add inline suppression with justification
/* eslint-disable-next-line security/detect-object-injection */
const value = obj[key]; // Safe: key is validated above
```

**For Dependency Audit:**
```bash
# Generate exceptions file
npm audit --json > audit-exceptions.json

# Or update specific package
npm update <package-name>
```

**For Secret Scanning:**
```bash
# Add to .gitignore
echo "path/to/false-positive" >> .gitignore

# Or use TruffleHog allowlist
```

### Issue: Build Failing After Auto-Update PR

**Steps:**
1. Review the PR diff carefully
2. Check breaking changes in changelog
3. Update code if API changed
4. Close auto-update PR if not safe
5. Manual update with proper testing

---

## 📈 Metrics & Monitoring

### Track These Metrics

```bash
# Vulnerability trend
cat audit-results.json | jq '.metadata.vulnerabilities'

# Test pass rate
cat security-test-results.json | jq '.passed | length'

# Time to fix (manual tracking)
# From issue creation to PR merge
```

### Weekly Security Review Checklist

- [ ] Review security scan artifacts
- [ ] Check for new critical vulnerabilities
- [ ] Investigate failed tests
- [ ] Review auto-update PRs
- [ ] Update security documentation
- [ ] Monitor for security advisories

---

## 🎯 Best Practices

### Before Committing
```bash
# Run full security suite
node scripts/security-tests.js

# Quick audit
npm audit

# Lint security issues
npx eslint . --config .eslintrc.security.json
```

### Before Merging PR
1. ✅ All security checks passed
2. ✅ No new vulnerabilities introduced
3. ✅ Security review comment posted
4. ✅ Dependencies up to date
5. ✅ No hardcoded secrets

### Regular Maintenance
- **Daily:** Review automated scan results
- **Weekly:** Check dependency updates
- **Monthly:** Review and update security config
- **Quarterly:** Update security documentation

---

## 🆘 Getting Help

### Common Questions

**Q: How do I add a new edge function securely?**
```typescript
// 1. Use shared utilities
import { corsHeaders } from '../_shared/corsHeaders.ts';
import { verifyAuth } from '../_shared/authHelpers.ts';
import { maskUserInfo } from '../_shared/piiMasking.ts';

// 2. Verify authentication
const { user, error } = await verifyAuth(req);
if (error) return errorResponse(error, 401);

// 3. Mask PII in logs
console.log('User action', maskUserInfo(user));

// 4. Add tests in scripts/security-tests.js
```

**Q: How do I handle a new vulnerability?**
1. Check severity and exploitability
2. Search for updates: `npm update <package>`
3. If no update, check for workarounds
4. Consider alternative packages
5. Document risk acceptance if unavoidable

**Q: Can I disable a security check?**
Yes, but document why:
```javascript
// scripts/security-tests.js
// testSpecificCheck(); // DISABLED: False positives in test files
// Risk: Low - validated manually
// Next review: 2025-03-01
```

### Resources

- [Security Hardening Guide](./SECURITY-HARDENING.md)
- [CI/CD Security Docs](./CI-CD-SECURITY.md)
- [GitHub Security Policy](../.github/SECURITY.md)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

## 🎉 Success Criteria

Your security testing is working when:

✅ All tests pass in CI/CD  
✅ No critical vulnerabilities  
✅ Auto-updates merged regularly  
✅ Security reports reviewed weekly  
✅ Team follows security best practices  
✅ Fast incident response time  

---

**Last Updated:** December 2025  
**Version:** 1.0  
**Maintainer:** Security Team
