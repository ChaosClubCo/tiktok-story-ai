# Contributing to MiniDrama Script Generator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the MiniDrama Script Generator project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Security Vulnerabilities](#security-vulnerabilities)

---

## Code of Conduct

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or bun package manager
- Git
- Supabase CLI (for local edge function development)

### Local Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd tiktok-story-ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev
```

### Environment Variables

Required variables for local development:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_POSTHOG_KEY` | PostHog analytics key (optional) |

---

## Development Workflow

### Branch Strategy

1. **Main Branch (`main`)** - Production-ready code
2. **Feature Branches** - Named `feature/short-description`
3. **Bug Fix Branches** - Named `fix/issue-description`
4. **Hotfix Branches** - Named `hotfix/critical-fix`

### Workflow Steps

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... code changes ...

# 3. Run tests and linting
npm run lint
npm run test

# 4. Commit with conventional commit message
git commit -m "feat(scope): add new feature"

# 5. Push to origin
git push origin feature/your-feature-name

# 6. Create Pull Request on GitHub
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `security` - Security-related changes

**Examples:**
```
feat(scripts): add batch analysis feature
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
security(rls): add policy for new table
```

---

## Code Standards

### TypeScript

- **Strict mode enabled** - No `any` types unless absolutely necessary
- **Explicit return types** for public functions
- **Interface over type** for object shapes
- **Use ES2023+ features** (optional chaining, nullish coalescing, etc.)

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  displayName: string | null;
  createdAt: Date;
}

const getUserName = (user: UserProfile): string => {
  return user.displayName ?? 'Anonymous';
};

// ❌ Bad
const getUserName = (user: any) => {
  return user.displayName || 'Anonymous';
};
```

### React Components

- **Functional components only** - No class components
- **Component files < 150 lines** - Split large components
- **Co-located hooks** - Custom hooks in separate files
- **Named exports** for components

```typescript
// ✅ Good - Small, focused component
export const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
  const initials = useUserInitials(user);
  
  return (
    <Avatar>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};

// ❌ Bad - Component doing too much
const UserProfileCard = () => {
  // 200+ lines of code with multiple responsibilities
};
```

### Styling

- **Use Tailwind CSS** - No inline styles or CSS modules
- **Use semantic tokens** - Colors from design system (`bg-primary`, not `bg-[#8B5CF6]`)
- **Mobile-first** - Base styles for mobile, then add breakpoints
- **HSL colors only** - All custom colors must be HSL

```typescript
// ✅ Good - Uses design tokens
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</Button>

// ❌ Bad - Hardcoded colors
<Button className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]">
  Click me
</Button>
```

### File Organization

```
src/components/
├── ui/                    # shadcn/ui base components
├── shared/                # Reusable across features
├── [feature]/             # Feature-specific components
│   ├── FeatureComponent.tsx
│   ├── FeatureList.tsx
│   └── index.ts           # Barrel exports
```

---

## Testing Guidelines

### Test Coverage Requirements

- **Unit Tests** - 90% coverage for utility functions
- **Integration Tests** - Key user flows
- **E2E Tests** - Critical paths (auth, core features)

### Running Tests

```bash
# Unit tests with Vitest
npm run test
npm run test:watch
npm run test:coverage

# E2E tests with Playwright
npx playwright test
npx playwright test --ui

# Security regression tests
node scripts/security-tests.js
```

### Writing Tests

```typescript
// Unit test example
import { describe, it, expect } from 'vitest';
import { calculateViralScore } from './utils';

describe('calculateViralScore', () => {
  it('should return 0 for empty content', () => {
    expect(calculateViralScore('')).toBe(0);
  });

  it('should calculate score based on engagement metrics', () => {
    const result = calculateViralScore({
      hookStrength: 8,
      emotionalImpact: 7,
      shareability: 9,
    });
    expect(result).toBeGreaterThan(70);
  });
});
```

### E2E Test Pattern

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user login', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm run test`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ No TypeScript errors
4. ✅ Security scan clean (for security-related changes)
5. ✅ Documentation updated (if applicable)
6. ✅ Changelog entry added (for features/fixes)

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
Describe tests you ran and how to reproduce

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
```

### Review Process

1. Automated checks must pass (linting, tests, build)
2. At least one approving review required
3. All comments must be resolved
4. Branch must be up-to-date with main

---

## Issue Guidelines

### Bug Reports

Include:
- Clear title describing the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/videos (if applicable)
- Environment details (browser, OS)

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed solution (if any)
- Alternative solutions considered

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `feature` | New feature request |
| `enhancement` | Improvement to existing feature |
| `documentation` | Documentation update needed |
| `security` | Security-related issue |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |

---

## Security Vulnerabilities

### Reporting Security Issues

**Do NOT open a public issue for security vulnerabilities.**

Instead, please email: **security@minidrama.app**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **24 hours** - Initial acknowledgment
- **72 hours** - Preliminary assessment
- **7 days** - Fix or mitigation plan
- **30 days** - Public disclosure (after fix)

---

## Resources

### Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Security Guidelines](docs/SECURITY-HARDENING.md)
- [API Documentation](docs/AI-INTEGRATION.md)
- [Video Pipeline](docs/VIDEO-GENERATION.md)

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview build

# Testing
npm run test             # Run unit tests
npm run test:coverage    # Coverage report
npx playwright test      # E2E tests

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix issues
```

---

## Questions?

- Check existing issues and discussions
- Review documentation
- Reach out to maintainers

Thank you for contributing to MiniDrama! 🎬
