# CLAUDE.md - AI Assistant Context

> This file provides essential context for Claude Code and other AI assistants working on this codebase.

---

## Project Overview

**MiniDrama AI** is a production-grade full-stack platform for AI-powered viral script and video generation. The platform targets content creators on TikTok, Instagram Reels, and YouTube Shorts.

### Core Purpose
- Generate engaging mini-drama scripts using AI
- Predict viral potential with scoring algorithms
- Automate video production pipeline
- Enable A/B testing and version control for scripts

---

## Architecture Summary

### Frontend Stack
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** components
- **TanStack Query** for server state
- **React Router** for navigation
- **Framer Motion** for animations

### Backend Stack
- **Supabase** (PostgreSQL + Edge Functions + Auth)
- **40+ Deno Edge Functions**
- **Row-Level Security (RLS)** on all tables
- **OpenAI** + **Lovable AI Gateway** for AI services

### Key Directories
```
src/components/     # React components (organized by feature)
src/hooks/          # 16 custom React hooks
src/lib/            # Utilities and AI integration
src/pages/          # Route pages (20+ routes)
supabase/functions/ # 40+ Edge Functions
docs/               # Documentation
```

---

## Development Commands

```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Production build
npm run lint     # ESLint security scan
npm run preview  # Preview production build
```

---

## Critical Files to Understand

### Configuration
| File | Purpose |
|------|---------|
| `vite.config.ts` | Build configuration with PWA |
| `tailwind.config.ts` | Theme and design tokens |
| `tsconfig.json` | TypeScript strict mode |
| `supabase/config.toml` | Supabase project config |

### Core Application
| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component with routing |
| `src/hooks/useAuth.tsx` | Authentication context |
| `src/hooks/useAdmin.tsx` | Admin role management |
| `src/lib/ai/lovableAI.ts` | Unified AI client |

### Key Components
| Component | Purpose |
|-----------|---------|
| `ScriptWorkflow.tsx` | Main script generation flow |
| `Dashboard.tsx` | 16-tab feature dashboard |
| `VideoGenerator.tsx` | Video creation interface |

---

## Database Schema (23 Tables)

### User & Auth
- `profiles` - User profiles, onboarding status
- `admin_roles` - Admin role assignments
- `admin_audit_log` - Security audit trail
- `admin_totp` - 2FA secrets (encrypted)

### Content
- `scripts` - User scripts with metadata
- `script_versions` - Version history
- `script_branches` - Git-like branching
- `series` - Multi-episode series

### Video Production
- `video_projects` - Video generation projects
- `video_scenes` - Individual scenes
- `video_assets` - Generated media

### Analytics
- `predictions_history` - AI predictions
- `ab_tests` / `ab_test_variants` - A/B testing

---

## Edge Functions (40+ Total)

### Most Important
| Function | Purpose |
|----------|---------|
| `generate-script` | AI script generation |
| `analyze-script` | Script quality analysis |
| `ai-generate` | Unified AI endpoint |
| `save-script` | Save script to DB |
| `generate-scene-visuals` | Image generation |
| `generate-scene-audio` | TTS audio generation |

### Shared Utilities
Located in `supabase/functions/_shared/`:
- `corsHeaders.ts` - CORS configuration
- `authHelpers.ts` - Authentication utilities
- `errorHandler.ts` - Error response handling
- `piiMasking.ts` - PII protection
- `rateLimit.ts` - Rate limiting
- `aiClient.ts` - AI integration

---

## Security Considerations

### Always Remember
1. **100% RLS Coverage** - All tables have Row-Level Security
2. **PII Masking** - Never log full emails or user IDs
3. **Input Validation** - Validate all user inputs
4. **Rate Limiting** - Enforce on all public endpoints
5. **Sanitization** - Prevent XSS in all user content

### Admin Protection
```
Client Guard → Server Validation → RLS Policies → Data Access
```

### Content Safety
The `generate-script` function filters prohibited content:
- Self-harm keywords
- Violence/harassment
- Illegal activity
- Hate speech
- Explicit content

---

## Common Patterns

### Authentication Check
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, session, loading } = useAuth();
if (!user) return <Navigate to="/auth" />;
```

### Admin Check
```typescript
import { useAdmin } from '@/hooks/useAdmin';

const { isAdmin, adminRole, logAction } = useAdmin();
if (!isAdmin) return <Navigate to="/dashboard" />;
```

### Data Fetching
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const { data, isLoading, error } = useQuery({
  queryKey: ['scripts'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
});
```

### Edge Function Call
```typescript
const { data, error } = await supabase.functions.invoke('generate-script', {
  body: { niche, length, tone, topic, scriptMode }
});
```

### AI Generation
```typescript
import { generateImage, chat, generateAudio } from '@/lib/ai/lovableAI';

const { imageUrl, error } = await generateImage({ prompt: 'scene description' });
const { response } = await chat([{ role: 'user', content: 'prompt' }]);
const { audioUrl } = await generateAudio('text to speak', 'alloy');
```

---

## Code Quality Standards

### File Size Limits
- Components: **< 150 lines**
- Hooks: **< 100 lines**
- Utilities: **< 200 lines**

### Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.tsx`
- Utilities: `camelCase.ts`
- Types: `PascalCase` (prefix with `I` for interfaces if needed)

### Import Order
1. React imports
2. Third-party libraries
3. Alias imports (`@/`)
4. Relative imports
5. Type imports

---

## Testing Guidelines

### Unit Tests (Vitest)
```typescript
// src/lib/__tests__/example.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('[name="email"]', 'test@example.com');
  // ...
});
```

---

## Known Issues & Workarounds

### TypeScript Compiler Stack Overflow
**Problem:** Creating many complex files simultaneously crashes the TypeScript compiler.
**Solution:** Create files one at a time, wait for compilation, then proceed.

### Heavy Library Imports
**Problem:** Libraries like `jspdf`, `xlsx` increase bundle size.
**Solution:** Use dynamic imports:
```typescript
const jsPDF = (await import('jspdf')).default;
```

### Rate Limiting
**Problem:** AI endpoints have rate limits.
**Solution:** Implement client-side throttling with `useRateLimit` hook.

---

## Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Optional
VITE_POSTHOG_KEY=your_posthog_key

# Edge Function Secrets (in Supabase Dashboard)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
```

---

## Debugging Tips

### Check Auth State
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Check RLS Issues
```sql
-- In Supabase SQL Editor
SELECT * FROM scripts WHERE user_id = 'your-user-id';
```

### Check Edge Function Logs
- Open Supabase Dashboard
- Navigate to Edge Functions
- Click on function name
- View logs in real-time

---

## Deployment Checklist

- [ ] All tests passing
- [ ] Security scan clean (`npm run lint`)
- [ ] No console.log statements
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] PWA icons configured

---

## Quick Reference

### Subscription Tiers
| Tier | Price | Features |
|------|-------|----------|
| Creator | $9/mo | Basic generation |
| Pro | $19/mo | Advanced features |
| Studio | $49/mo | Full access |

### Script Modes
| Mode | Description |
|------|-------------|
| `standard` | Traditional mini-drama |
| `pov_skit` | POV with hook variations |
| `ai_storytime` | TTS-optimized stories |

### Admin Roles
| Role | Permissions |
|------|-------------|
| `super_admin` | Full access |
| `support_admin` | Read-only |
| `content_moderator` | Content management |

---

## Getting Help

- **Architecture:** See `docs/ARCHITECTURE.md`
- **Security:** See `docs/SECURITY-HARDENING.md`
- **AI Integration:** See `docs/AI-INTEGRATION.md`
- **Video Pipeline:** See `docs/VIDEO-GENERATION.md`

---

**Last Updated:** December 2025
