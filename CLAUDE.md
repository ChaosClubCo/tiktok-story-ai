# CLAUDE.md

## Project: TikTok Story AI (MiniDrama AI)

AI-powered viral script + video generation platform for TikTok, Instagram Reels, YouTube Shorts.
Solo developer project. Production Supabase instance — no local Supabase.

## Quick Reference

```bash
npm run dev          # Vite dev server on :8080
npm run build        # Production build
npm run lint         # ESLint security scan
npx supabase functions deploy <name>   # Deploy single edge function
npx supabase functions deploy          # Deploy all edge functions
npx supabase db push                   # Push migrations to remote
npx supabase db pull                   # Pull remote schema changes
npx supabase secrets list              # List edge function secrets
npx supabase secrets set KEY=value     # Set edge function secret
```

## Architecture

**Frontend:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui + TanStack Query
**Backend:** Supabase (PostgreSQL + 40+ Deno Edge Functions + Auth + RLS)
**AI Gateway:** Lovable AI Gateway (`ai.gateway.lovable.dev`) → routes to Gemini/GPT
**Deployment:** Vercel (frontend) + Supabase Cloud (backend)
**Supabase Project:** `ilbwzcigrdqozvptboqh`

### Critical Paths

```
src/integrations/supabase/client.ts    # Supabase client (hardcoded URL + anon key)
src/integrations/supabase/types.ts     # Auto-generated DB types (DO NOT edit manually)
src/hooks/useAuth.tsx                  # Auth context (wraps Supabase Auth)
src/lib/ai/lovableAI.ts               # Client-side AI calls
supabase/functions/_shared/aiClient.ts # Server-side AI calls (Lovable gateway)
supabase/functions/_shared/prompts/v1.ts # ALL prompt templates (single source of truth)
supabase/functions/generate-script/    # Script generation (most important edge fn)
supabase/functions/fetch-trends/       # Trend data (currently 8 hardcoded trends)
```

### AI Models (via Lovable Gateway)

| Purpose | Model | Location |
|---------|-------|----------|
| Image gen | `google/gemini-3-pro-image-preview` | `_shared/aiClient.ts` |
| Chat default | `google/gemini-2.5-flash` | `_shared/aiClient.ts` |
| Chat pro | `google/gemini-2.5-pro` | `_shared/aiClient.ts` |
| TTS | `tts-1` (OpenAI) | `generate-scene-audio/` |

### Database: 25 tables, 100% RLS, 31 migrations

Key tables: `profiles`, `scripts`, `script_versions`, `script_branches`, `series`,
`video_projects`, `video_scenes`, `video_assets`, `predictions_history`,
`ab_tests`, `ab_test_variants`, `trending_topics`, `admin_roles`, `admin_audit_log`

## Known Blockers & Tech Debt

1. **OAuth broken** — Auth flow not completing. Users cannot log in. Top priority.
2. **Hardcoded trends** — `fetch-trends/index.ts` has 8 static `CURATED_TRENDS`. Needs real-time trend data via TikTok Research API or proxy (Apify/RapidAPI) on scheduled cadence.
3. **trending_topics RLS** — `USING (true)` exposes trend data publicly. Restrict to authenticated users.
4. **.env.example stale** — References old project `aughkdwuvkgigczkfozp`. Active project is `ilbwzcigrdqozvptboqh`.
5. **Lovable gateway dependency** — All AI calls route through `ai.gateway.lovable.dev`. No direct OpenAI/Gemini fallback. Single point of failure.
6. **No prompt versioning infra** — Prompts in `v1.ts` are versioned by filename only. No A/B testing, no rollback, no metrics per prompt variant.
7. **No C2PA metadata** — No AI content disclosure metadata embedded at generation time. Required for TikTok/YouTube compliance.

## Conventions

### Code Standards
- Components < 150 lines, hooks < 100 lines, utilities < 200 lines
- TypeScript strict mode — type everything
- Imports: React → third-party → `@/` aliases → relative → types
- Dynamic imports for heavy libs (`jspdf`, `xlsx`, `@ffmpeg`)
- All user content sanitized (XSS prevention via `src/lib/sanitization.ts`)

### Edge Functions (Deno)
- Every public function: auth check → rate limit → input validation → business logic → PII-masked logging
- Always use shared utilities from `_shared/` (corsHeaders, authHelpers, errorHandler, piiMasking, rateLimit)
- CORS headers required on every response including OPTIONS preflight
- Service role client for admin operations, user token for user operations
- Never log raw emails or full user IDs — use `truncateUserId()` from piiMasking

### Security (Non-negotiable)
- 100% RLS on every table — no exceptions
- PII masking in all logs
- Rate limiting on all public endpoints
- Input validation with Zod schemas server-side
- Content safety filtering in `generate-script` (self-harm, violence, hate speech, explicit)
- Admin routes: client guard → server validation → RLS → data access

### Git Workflow
- Branch from `main` as `feature/<description>` or `fix/<description>`
- Commits: conventional format (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- No direct commits to `main`
- 17+ stale `edit/edt-*` branches from Lovable — ignore, pending cleanup

### Script Modes
| Mode | System Prompt Key | Format |
|------|-------------------|--------|
| `standard` | `generateScript.system.standard` | Traditional mini-drama with scenes |
| `ai_storytime` | `generateScript.system.storytime` | TTS-optimized with [PAUSE] markers |
| `pov_skit` | `generateScript.system.pov` | POV format with 5 hook variations |

## Common Patterns

### Supabase Edge Function Template
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";
import { truncateUserId } from "../_shared/piiMasking.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token!);
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Business logic here
    return new Response(JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
```

### Client-Side Data Fetching
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['scripts'],
  queryFn: async () => {
    const { data, error } = await supabase.from('scripts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
});
```

### Edge Function Invocation
```typescript
const { data, error } = await supabase.functions.invoke('generate-script', {
  body: { niche, length, tone, topic, scriptMode }
});
```

## Testing

- **Unit:** Vitest — `src/lib/__tests__/`, `src/hooks/__tests__/`, `src/utils/__tests__/`
- **E2E:** Playwright — `e2e/` directory (auth, dashboard, scripts, video, a11y, visual regression)
- **Security:** Custom scripts in `scripts/penetration-tests.js`, `scripts/security-tests.js`
- **CI:** GitHub Actions — `test-all.yml`, `security-scan.yml`, `e2e-tests.yml`, `dependency-check.yml`

## Business Context

| Tier | Price | Purpose |
|------|-------|---------|
| Creator | $9/mo | Basic generation |
| Pro | $19/mo | Advanced features |
| Studio | $49/mo | Full access |

Target audience: TikTok/Reels/Shorts creators. "Missing middle" independents earning $5K-100K/month.
Competitive moat: Character consistency across video sequences + integrated trend-to-script pipeline.
