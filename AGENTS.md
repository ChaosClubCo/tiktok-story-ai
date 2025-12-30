# AGENTS.md - Multi-Agent AI Documentation

> Documentation for AI agents working collaboratively on the MiniDrama AI codebase.

---

## Overview

This document provides context for multiple AI agents that may work on different aspects of the codebase simultaneously or sequentially. It ensures consistency and prevents conflicts.

---

## Agent Roles & Responsibilities

### 1. Frontend Agent
**Focus:** React components, UI/UX, styling

**Key Areas:**
- `src/components/` - All React components
- `src/pages/` - Route pages
- `src/hooks/` - Custom hooks (except auth/admin)
- `tailwind.config.ts` - Design system

**Guidelines:**
- Keep components under 150 lines
- Use shadcn/ui for UI primitives
- Follow feature-based organization
- Implement loading and error states
- Ensure accessibility (ARIA, keyboard nav)

**Common Tasks:**
- Adding new UI features
- Improving user experience
- Fixing visual bugs
- Implementing responsive designs

---

### 2. Backend Agent
**Focus:** Supabase Edge Functions, database, API

**Key Areas:**
- `supabase/functions/` - Edge functions
- `supabase/functions/_shared/` - Shared utilities
- Database schema and migrations
- RLS policies

**Guidelines:**
- Always use shared utilities from `_shared/`
- Implement rate limiting on public endpoints
- Use PII masking in all logs
- Validate all inputs
- Return consistent error responses

**Common Tasks:**
- Creating new edge functions
- Modifying database schema
- Implementing business logic
- Fixing API issues

---

### 3. AI Integration Agent
**Focus:** AI services, prompts, generation logic

**Key Areas:**
- `src/lib/ai/` - AI client and configuration
- `supabase/functions/generate-script/`
- `supabase/functions/ai-generate/`
- `supabase/functions/analyze-script/`

**Guidelines:**
- Use the Lovable AI Gateway for all AI calls
- Implement fallback models
- Handle rate limits gracefully
- Sanitize AI outputs
- Filter prohibited content

**Common Tasks:**
- Improving prompts
- Adding new AI features
- Optimizing AI performance
- Handling AI errors

---

### 4. Security Agent
**Focus:** Security hardening, compliance, auditing

**Key Areas:**
- `supabase/functions/_shared/authHelpers.ts`
- `supabase/functions/_shared/piiMasking.ts`
- `src/hooks/useSecurityMonitoring.tsx`
- `docs/SECURITY-HARDENING.md`

**Guidelines:**
- Follow OWASP Top 10 protections
- Ensure GDPR/CCPA compliance
- Maintain 100% RLS coverage
- Log security events
- Never expose internal errors

**Common Tasks:**
- Security reviews
- Fixing vulnerabilities
- Adding security features
- Compliance verification

---

### 5. DevOps Agent
**Focus:** CI/CD, deployment, infrastructure

**Key Areas:**
- `.github/workflows/` - GitHub Actions
- `vite.config.ts` - Build configuration
- `supabase/config.toml` - Supabase config
- Deployment scripts

**Guidelines:**
- Maintain security scanning in CI
- Keep dependencies updated
- Monitor for vulnerabilities
- Document deployment processes

**Common Tasks:**
- CI/CD improvements
- Deployment fixes
- Performance optimization
- Infrastructure changes

---

### 6. Documentation Agent
**Focus:** Documentation, comments, guides

**Key Areas:**
- `README.md` - Project overview
- `docs/` - Technical documentation
- `CLAUDE.md` - AI assistant context
- Code comments

**Guidelines:**
- Keep docs up to date with code
- Use clear, concise language
- Include examples
- Document breaking changes

**Common Tasks:**
- Writing documentation
- Updating existing docs
- Adding code comments
- Creating guides

---

## Coordination Rules

### 1. File Ownership

To prevent conflicts, agents should claim ownership of files they're modifying:

```
// Agent: Frontend Agent
// Task: Implementing new button variant
// Status: In Progress
// Started: 2025-12-30T10:00:00Z
```

### 2. Shared Resource Access

**Database Schema:**
- Only Backend Agent modifies schema
- Frontend Agent reads types from `src/integrations/supabase/types.ts`
- Coordinate before schema changes

**Shared Utilities:**
- `_shared/` utilities are shared by all backend functions
- Coordinate before modifying shared utilities
- Test all affected functions after changes

**Configuration Files:**
- Coordinate before modifying:
  - `package.json`
  - `vite.config.ts`
  - `tailwind.config.ts`
  - `supabase/config.toml`

### 3. Conflict Resolution

If multiple agents need to modify the same file:

1. **Check for existing claims** in file headers
2. **Coordinate changes** through documentation
3. **Merge sequentially** with clear commits
4. **Test after each merge** to catch conflicts

---

## Communication Protocol

### Status Updates

Agents should update their status in a consistent format:

```yaml
Agent: [Agent Name]
Task: [Brief description]
Status: [Planning | In Progress | Blocked | Complete]
Files Modified:
  - path/to/file1.ts
  - path/to/file2.ts
Dependencies:
  - [Other agent/task dependencies]
Notes:
  - [Any relevant notes]
```

### Handoff Protocol

When passing work to another agent:

1. **Document current state** of the work
2. **List completed items** and remaining tasks
3. **Note any blockers** or concerns
4. **Provide context** for decisions made
5. **Include test status**

---

## Shared Context

### Current Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| React 18 + TypeScript | Type safety, modern features |
| Supabase backend | Rapid development, built-in auth |
| OpenAI for generation | Best quality for text |
| Gemini for images | Cost-effective, good quality |
| FFmpeg WASM | Browser-based video processing |

### Technical Constraints

| Constraint | Impact |
|------------|--------|
| TypeScript strict mode | Must type everything |
| 100% RLS coverage | Every table needs policies |
| PII masking | Never log full emails/IDs |
| Rate limits | Handle 429 responses |
| Bundle size | Use dynamic imports for heavy libs |

### Current Priorities

1. **Stability** - Maintain production quality
2. **Security** - Never introduce vulnerabilities
3. **Performance** - Keep bundle size optimized
4. **UX** - Smooth user experience

---

## Common Patterns

### Adding a New Feature

```
1. Frontend Agent: Create UI components
2. Backend Agent: Create edge function + DB tables
3. AI Integration Agent: If AI involved, integrate
4. Security Agent: Review for vulnerabilities
5. Documentation Agent: Update docs
```

### Fixing a Bug

```
1. Identify owning agent based on bug location
2. Investigate and fix
3. Security Agent: Review if security-related
4. Add regression test
5. Document fix in changelog
```

### Security Issue

```
1. Security Agent: Assess severity
2. Security Agent: Implement fix
3. Owning agent: Review fix for side effects
4. All agents: Check for similar issues
5. Documentation Agent: Update security docs
```

---

## Testing Responsibilities

### Unit Tests
- **Frontend Agent:** Component tests
- **Backend Agent:** Edge function tests
- **AI Integration Agent:** AI utility tests

### E2E Tests
- **Frontend Agent:** User flow tests
- **Security Agent:** Security regression tests

### Manual Testing
- All agents should manually test their changes
- Cross-browser testing for frontend changes
- Load testing for backend changes

---

## Code Review Guidelines

### What to Check

**Frontend Reviews:**
- Component size (< 150 lines)
- Accessibility compliance
- Loading/error states
- Mobile responsiveness

**Backend Reviews:**
- Input validation
- Error handling
- Rate limiting
- PII protection
- RLS policies

**AI Reviews:**
- Prompt effectiveness
- Fallback handling
- Content safety
- Rate limit handling

**Security Reviews:**
- OWASP compliance
- Input sanitization
- Authentication checks
- Authorization checks

---

## Emergency Procedures

### Production Issue

1. **Assess impact** - Users affected?
2. **Quick fix or rollback** - Decide approach
3. **Implement fix** with minimal changes
4. **Test thoroughly** before deploy
5. **Document incident** for learning

### Security Incident

1. **Assess severity** immediately
2. **Contain if possible** (disable feature)
3. **Fix vulnerability**
4. **Audit for data exposure**
5. **Document and notify** if required

---

## Agent Interaction Matrix

| From \ To | Frontend | Backend | AI | Security | DevOps | Docs |
|-----------|----------|---------|-----|----------|--------|------|
| Frontend | - | API needs | AI features | Security review | Build issues | UI docs |
| Backend | Types | - | AI integration | Security review | Deployment | API docs |
| AI | UI needs | API needs | - | AI safety | - | AI docs |
| Security | UI audit | API audit | AI audit | - | CI security | Security docs |
| DevOps | Build | Deploy | - | CI security | - | DevOps docs |
| Docs | UI docs | API docs | AI docs | Security docs | - | - |

---

## Quick Reference

### File Types by Agent

| File Pattern | Primary Agent |
|--------------|---------------|
| `src/components/*.tsx` | Frontend |
| `src/pages/*.tsx` | Frontend |
| `src/hooks/use*.tsx` | Frontend |
| `supabase/functions/*/index.ts` | Backend |
| `supabase/functions/_shared/*` | Backend |
| `src/lib/ai/*` | AI Integration |
| `**/auth*.ts` | Security |
| `.github/workflows/*` | DevOps |
| `docs/*.md` | Documentation |

### Critical Paths

These files affect multiple agents - coordinate carefully:

- `src/App.tsx` - Application root
- `src/hooks/useAuth.tsx` - Authentication
- `src/integrations/supabase/client.ts` - Supabase client
- `package.json` - Dependencies
- `supabase/config.toml` - Backend config

---

## Appendix: Agent Capabilities

### Frontend Agent Capabilities
- React component development
- TypeScript/JavaScript
- CSS/Tailwind styling
- State management
- Routing
- Form handling
- Animation

### Backend Agent Capabilities
- Deno/TypeScript
- PostgreSQL
- REST API design
- Database modeling
- Edge function development
- RLS policy creation

### AI Integration Agent Capabilities
- OpenAI API
- Gemini API
- Prompt engineering
- AI safety
- Streaming responses
- Error handling

### Security Agent Capabilities
- Security auditing
- Penetration testing
- OWASP compliance
- GDPR/CCPA compliance
- Cryptography
- Authentication/Authorization

### DevOps Agent Capabilities
- CI/CD pipelines
- GitHub Actions
- Vite configuration
- Supabase deployment
- Performance optimization

### Documentation Agent Capabilities
- Technical writing
- API documentation
- User guides
- Code comments
- Changelog maintenance

---

**Document Version:** 1.0
**Last Updated:** December 2025
