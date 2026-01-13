#!/usr/bin/env node

/**
 * Security Regression Test Suite
 * 
 * Validates security configurations and patterns across the codebase
 * to prevent regression of security fixes.
 */

const fs = require('fs');
const path = require('path');

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: [],
  timestamp: new Date().toISOString()
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function pass(testName) {
  results.passed.push(testName);
  log(`✅ PASS: ${testName}`, colors.green);
}

function fail(testName, reason) {
  results.failed.push({ test: testName, reason });
  log(`❌ FAIL: ${testName}`, colors.red);
  log(`   Reason: ${reason}`, colors.red);
}

function warn(testName, reason) {
  results.warnings.push({ test: testName, reason });
  log(`⚠️  WARN: ${testName}`, colors.yellow);
  log(`   Reason: ${reason}`, colors.yellow);
}

// Utility: Search for pattern in directory
function searchInDirectory(dir, pattern, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  
  function search(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
          search(filePath);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            results.push({
              file: filePath,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }
    }
  }
  
  search(dir);
  return results;
}

// Test 1: No dangerouslySetInnerHTML usage
function testNoDangerousHTML() {
  const testName = 'No dangerouslySetInnerHTML usage';
  const pattern = /dangerouslySetInnerHTML/;
  const matches = searchInDirectory('src', pattern);
  
  if (matches.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Found ${matches.length} occurrences:\n${matches.map(m => `  ${m.file}:${m.line}`).join('\n')}`);
  }
}

// Test 2: No eval() usage
function testNoEval() {
  const testName = 'No eval() usage';
  const pattern = /\beval\s*\(/;
  const srcMatches = searchInDirectory('src', pattern);
  const funcMatches = searchInDirectory('supabase/functions', pattern);
  
  const allMatches = [...srcMatches, ...funcMatches];
  
  if (allMatches.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Found ${allMatches.length} occurrences:\n${allMatches.map(m => `  ${m.file}:${m.line}`).join('\n')}`);
  }
}

// Test 3: PII masking in edge functions (comprehensive coverage)
function testPIIMasking() {
  const testName = 'PII masking in edge functions';
  
  if (!fs.existsSync('supabase/functions/_shared/piiMasking.ts')) {
    fail(testName, 'PII masking utility not found at supabase/functions/_shared/piiMasking.ts');
    return;
  }
  
  // Check ALL edge functions that handle user data
  const criticalFunctions = [
    // Authentication & Admin
    'verify-admin-access',
    'admin-2fa',
    'admin-get-users',
    'admin-get-content',
    // Payment
    'check-subscription',
    'create-checkout',
    'customer-portal',
    // User content
    'send-registration-email',
    'save-script',
    'get-user-scripts',
    'analyze-script',
    'generate-script',
    // Version control
    'create-branch',
    'merge-branch',
    'switch-branch',
    'create-script-version',
    // A/B Testing
    'run-ab-test',
    'complete-ab-test',
    // Video generation
    'generate-video-project',
    'get-video-projects',
    // Series
    'generate-series',
    'fetch-trends'
  ];
  
  const missing = [];
  const piiPatterns = [
    'maskEmail',
    'maskUserInfo',
    'truncateUserId',
    'maskSensitiveData',
    'piiMasking'
  ];
  
  for (const func of criticalFunctions) {
    const funcPath = path.join('supabase/functions', func, 'index.ts');
    if (fs.existsSync(funcPath)) {
      const content = fs.readFileSync(funcPath, 'utf8');
      const hasPIIMasking = piiPatterns.some(pattern => content.includes(pattern));
      if (!hasPIIMasking) {
        missing.push(func);
      }
    }
  }
  
  if (missing.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Missing PII masking in: ${missing.join(', ')}`);
  }
}

// Test 4: CORS headers in edge functions
function testCORSHeaders() {
  const testName = 'CORS headers in edge functions';
  
  const functionsDir = 'supabase/functions';
  if (!fs.existsSync(functionsDir)) {
    warn(testName, 'supabase/functions directory not found');
    return;
  }
  
  const functions = fs.readdirSync(functionsDir)
    .filter(f => fs.statSync(path.join(functionsDir, f)).isDirectory())
    .filter(f => f !== '_shared');
  
  const missing = [];
  
  for (const func of functions) {
    const funcPath = path.join(functionsDir, func, 'index.ts');
    if (fs.existsSync(funcPath)) {
      const content = fs.readFileSync(funcPath, 'utf8');
      if (!content.includes('corsHeaders') && !content.includes('Access-Control-Allow-Origin')) {
        missing.push(func);
      }
    }
  }
  
  if (missing.length === 0) {
    pass(testName);
  } else {
    warn(testName, `Missing CORS headers in: ${missing.join(', ')}`);
  }
}

// Test 5: No hardcoded secrets
function testNoHardcodedSecrets() {
  const testName = 'No hardcoded secrets';
  
  // Patterns for common secrets (excluding obvious test/example values)
  const secretPatterns = [
    /(['"])(?:sk_live_|pk_live_|rk_live_)[a-zA-Z0-9]{20,}\1/,  // Stripe keys
    /(['"])[a-f0-9]{32}\1/,  // 32-char hex (potential API keys)
    /password\s*[:=]\s*['"][^'"]{8,}['"]/i,  // Password assignments
    /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/i  // API key assignments
  ];
  
  const suspiciousFiles = [];
  
  for (const pattern of secretPatterns) {
    const matches = searchInDirectory('src', pattern);
    const funcMatches = searchInDirectory('supabase/functions', pattern);
    suspiciousFiles.push(...matches, ...funcMatches);
  }
  
  // Filter out common false positives
  const filtered = suspiciousFiles.filter(m => 
    !m.content.includes('example') && 
    !m.content.includes('test') &&
    !m.content.includes('placeholder')
  );
  
  if (filtered.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Potential secrets found:\n${filtered.map(m => `  ${m.file}:${m.line} - ${m.content}`).join('\n')}`);
  }
}

// Test 6: Input validation present
function testInputValidation() {
  const testName = 'Input validation in forms';
  
  const validationFiles = [
    'src/lib/authValidation.ts',
    'src/lib/sanitization.ts'
  ];
  
  const missing = validationFiles.filter(f => !fs.existsSync(f));
  
  if (missing.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Missing validation files: ${missing.join(', ')}`);
  }
}

// Test 7: RLS policies in migrations
function testRLSPolicies() {
  const testName = 'RLS policies in database';
  
  // Check that migrations directory exists
  if (!fs.existsSync('supabase/migrations')) {
    warn(testName, 'No migrations directory found');
    return;
  }
  
  // Check for RLS-related SQL
  const migrations = fs.readdirSync('supabase/migrations')
    .filter(f => f.endsWith('.sql'));
  
  let rlsCount = 0;
  
  for (const migration of migrations) {
    const content = fs.readFileSync(path.join('supabase/migrations', migration), 'utf8');
    if (content.includes('enable row level security') || content.includes('CREATE POLICY')) {
      rlsCount++;
    }
  }
  
  if (rlsCount > 0) {
    pass(testName);
  } else {
    warn(testName, 'No RLS policies found in migrations (may be configured externally)');
  }
}

// Test 8: Security headers function exists
function testSecurityHeaders() {
  const testName = 'Security headers function';
  const securityHeadersPath = 'supabase/functions/security-headers/index.ts';
  
  if (fs.existsSync(securityHeadersPath)) {
    const content = fs.readFileSync(securityHeadersPath, 'utf8');
    
    // Check for key security headers
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security'
    ];
    
    const missing = requiredHeaders.filter(h => !content.includes(h));
    
    if (missing.length === 0) {
      pass(testName);
    } else {
      fail(testName, `Missing security headers: ${missing.join(', ')}`);
    }
  } else {
    fail(testName, 'Security headers function not found');
  }
}

// Test 9: Rate limiting implementation
function testRateLimiting() {
  const testName = 'Rate limiting implementation';
  const rateLimitPath = 'supabase/functions/_shared/rateLimit.ts';
  
  if (fs.existsSync(rateLimitPath)) {
    pass(testName);
  } else {
    warn(testName, 'Rate limiting utility not found');
  }
}

// Test 10: No raw SQL execution in edge functions
function testNoRawSQL() {
  const testName = 'No raw SQL execution';
  
  const dangerousPatterns = [
    /\.rpc\s*\(\s*['"]execute[_-]?sql/i,
    /\.query\s*\(\s*['"]SELECT|INSERT|UPDATE|DELETE/i,
    /supabase\.sql/i
  ];
  
  const matches = [];
  
  for (const pattern of dangerousPatterns) {
    matches.push(...searchInDirectory('supabase/functions', pattern));
  }
  
  if (matches.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Potential raw SQL execution:\n${matches.map(m => `  ${m.file}:${m.line}`).join('\n')}`);
  }
}

// Test 11: Admin 2FA implementation
function testAdmin2FA() {
  const testName = 'Admin 2FA implementation';
  
  const requiredFiles = [
    'supabase/functions/admin-2fa/index.ts',
    'src/hooks/useAdmin2FA.tsx',
    'src/components/admin/Admin2FASettings.tsx'
  ];
  
  const missing = requiredFiles.filter(f => !fs.existsSync(f));
  
  if (missing.length === 0) {
    // Verify TOTP functionality
    const admin2faContent = fs.readFileSync('supabase/functions/admin-2fa/index.ts', 'utf8');
    const requiredFeatures = ['setup', 'verify', 'backup_codes', 'disable'];
    const missingFeatures = requiredFeatures.filter(f => !admin2faContent.toLowerCase().includes(f));
    
    if (missingFeatures.length === 0) {
      pass(testName);
    } else {
      fail(testName, `Missing 2FA features: ${missingFeatures.join(', ')}`);
    }
  } else {
    fail(testName, `Missing 2FA files: ${missing.join(', ')}`);
  }
}

// Test 12: Security definer functions for RLS
function testSecurityDefinerFunctions() {
  const testName = 'Security definer functions';
  
  // Check for has_role function usage in edge functions
  const adminFunctions = ['verify-admin-access', 'admin-get-users', 'admin-get-content'];
  let hasSecurityDefiner = false;
  
  for (const func of adminFunctions) {
    const funcPath = path.join('supabase/functions', func, 'index.ts');
    if (fs.existsSync(funcPath)) {
      const content = fs.readFileSync(funcPath, 'utf8');
      if (content.includes('has_role') || content.includes('is_admin')) {
        hasSecurityDefiner = true;
        break;
      }
    }
  }
  
  if (hasSecurityDefiner) {
    pass(testName);
  } else {
    warn(testName, 'Security definer functions not found in admin edge functions');
  }
}

// Test 13: Structured logging in edge functions
function testStructuredLogging() {
  const testName = 'Structured logging in edge functions';
  
  const functionsDir = 'supabase/functions';
  const functions = fs.readdirSync(functionsDir)
    .filter(f => fs.statSync(path.join(functionsDir, f)).isDirectory())
    .filter(f => f !== '_shared');
  
  const withoutLogging = [];
  
  for (const func of functions) {
    const funcPath = path.join(functionsDir, func, 'index.ts');
    if (fs.existsSync(funcPath)) {
      const content = fs.readFileSync(funcPath, 'utf8');
      // Check for structured logging pattern
      if (!content.includes('logStep') && !content.includes('console.log(`[')) {
        withoutLogging.push(func);
      }
    }
  }
  
  if (withoutLogging.length <= 3) {  // Allow some tolerance
    pass(testName);
  } else {
    warn(testName, `Edge functions without structured logging: ${withoutLogging.join(', ')}`);
  }
}

// Test 14: Auth header validation in edge functions  
function testAuthHeaderValidation() {
  const testName = 'Auth header validation';
  
  const functionsDir = 'supabase/functions';
  const functions = fs.readdirSync(functionsDir)
    .filter(f => fs.statSync(path.join(functionsDir, f)).isDirectory())
    .filter(f => f !== '_shared' && f !== 'demo-viral-score' && f !== 'security-headers');
  
  const missingAuth = [];
  
  for (const func of functions) {
    const funcPath = path.join(functionsDir, func, 'index.ts');
    if (fs.existsSync(funcPath)) {
      const content = fs.readFileSync(funcPath, 'utf8');
      // Check for auth validation patterns
      const hasAuth = content.includes('Authorization') || 
                      content.includes('getUser') ||
                      content.includes('verify_jwt');
      if (!hasAuth) {
        missingAuth.push(func);
      }
    }
  }
  
  if (missingAuth.length === 0) {
    pass(testName);
  } else {
    fail(testName, `Missing auth validation in: ${missingAuth.join(', ')}`);
  }
}

// Main test runner
async function runTests() {
  log('\n' + '='.repeat(60), colors.bold);
  log('Security Regression Test Suite', colors.bold + colors.blue);
  log('='.repeat(60) + '\n', colors.bold);
  
  // Run all tests
  testNoDangerousHTML();
  testNoEval();
  testPIIMasking();
  testCORSHeaders();
  testNoHardcodedSecrets();
  testInputValidation();
  testRLSPolicies();
  testSecurityHeaders();
  testRateLimiting();
  testNoRawSQL();
  testAdmin2FA();
  testSecurityDefinerFunctions();
  testStructuredLogging();
  testAuthHeaderValidation();
  
  // Summary
  log('\n' + '='.repeat(60), colors.bold);
  log('Test Summary', colors.bold + colors.blue);
  log('='.repeat(60), colors.bold);
  log(`✅ Passed: ${results.passed.length}`, colors.green);
  log(`❌ Failed: ${results.failed.length}`, colors.red);
  log(`⚠️  Warnings: ${results.warnings.length}`, colors.yellow);
  log('='.repeat(60) + '\n', colors.bold);
  
  // Write results to file
  fs.writeFileSync(
    'security-test-results.json',
    JSON.stringify(results, null, 2)
  );
  
  log(`Results saved to: security-test-results.json\n`, colors.blue);
  
  // Exit with error code if any tests failed
  if (results.failed.length > 0) {
    log('❌ Security tests FAILED\n', colors.red + colors.bold);
    process.exit(1);
  } else {
    log('✅ All security tests PASSED\n', colors.green + colors.bold);
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, colors.red);
  process.exit(1);
});
