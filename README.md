# MiniDrama AI

> AI-Powered Viral Script & Video Generation Platform for TikTok and Short-Form Content

[![Security](https://img.shields.io/badge/security-production--grade-green)](docs/SECURITY-HARDENING.md)
[![RLS Coverage](https://img.shields.io/badge/RLS%20coverage-100%25-brightgreen)](docs/RLS-PENETRATION-TEST-REPORT.md)
[![License](https://img.shields.io/badge/license-proprietary-blue)]()

---

## Overview

MiniDrama AI is a comprehensive full-stack platform that helps content creators generate viral scripts and videos for TikTok, Instagram Reels, and YouTube Shorts. The platform uses advanced AI models to generate engaging mini-drama scripts, predict viral potential, and automate video production.

### Key Features

- **AI Script Generation** - Multiple modes including standard, POV skits, and AI storytime
- **Viral Score Prediction** - AI-powered analysis predicting engagement potential
- **Video Generation Pipeline** - Automated scene visuals, TTS audio, and video assembly
- **A/B Testing Framework** - Test script variations to optimize performance
- **Version Control** - Git-like branching system for scripts
- **Analytics Dashboard** - Track performance metrics and improvement trends
- **Multi-Platform Adaptation** - Optimize content for different platforms
- **Creator Tools** - Collaboration, content calendar, wellness tracking

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.5.3 | Type Safety |
| Vite | 5.4.1 | Build Tool |
| Tailwind CSS | 3.4.11 | Styling |
| shadcn/ui | Latest | Component Library |
| TanStack Query | 5.56.2 | Server State Management |
| React Router | 6.26.2 | Routing |
| Framer Motion | 12.23.24 | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Database |
| Deno | Edge Functions Runtime |
| Row-Level Security | Data Protection |

### AI & ML
| Service | Purpose |
|---------|---------|
| OpenAI GPT-4o-mini | Script Generation |
| OpenAI TTS | Text-to-Speech |
| Lovable AI Gateway | Unified AI Access |
| Gemini 3 Pro Image | Visual Generation |

### Payments & Analytics
| Service | Purpose |
|---------|---------|
| Stripe | Subscription Management |
| PostHog | Product Analytics |
| Web Vitals | Performance Monitoring |

---

## Project Structure

```
tiktok-story-ai/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── shared/          # Reusable shared components
│   │   ├── admin/           # Admin panel components
│   │   ├── analytics/       # Analytics visualizations
│   │   ├── abtesting/       # A/B testing UI
│   │   ├── branching/       # Script versioning UI
│   │   ├── landing/         # Landing page sections
│   │   ├── settings/        # User settings
│   │   └── [feature]/       # Feature-specific components
│   ├── hooks/               # Custom React hooks (16 total)
│   ├── lib/                 # Utility libraries
│   │   └── ai/              # AI integration utilities
│   ├── pages/               # Route pages (20+ routes)
│   ├── integrations/        # External service integrations
│   │   └── supabase/        # Supabase client & types
│   ├── utils/               # Helper utilities
│   └── test/                # Test setup & utilities
├── supabase/
│   ├── functions/           # 40+ Edge Functions
│   │   ├── _shared/         # Shared utilities
│   │   ├── generate-script/ # Script generation
│   │   ├── analyze-script/  # Script analysis
│   │   ├── ai-generate/     # Unified AI endpoint
│   │   └── [function]/      # Other functions
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase configuration
├── docs/                    # Documentation
├── e2e/                     # End-to-end tests
├── scripts/                 # Utility scripts
├── public/                  # Static assets
└── .github/                 # CI/CD workflows
```

---

## Quick Start

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun
- Supabase CLI (for local development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tiktok-story-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_POSTHOG_KEY=your_posthog_key (optional)
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint security scan |

---

## Core Features

### 1. Script Generation

Generate viral scripts using multiple AI modes:

- **Standard Mode** - Traditional mini-drama scripts
- **POV Skit Mode** - Point-of-view scripts with hook variations
- **AI Storytime Mode** - TTS-optimized chaotic story scripts

```
User Input → generate-script Edge Function → OpenAI GPT-4o-mini
→ Script + Metadata → Database Storage → UI Display
```

### 2. Viral Score Prediction

AI-powered prediction scoring:

- Viral Score (0-100)
- Engagement Score
- Shareability Score
- Hook Strength
- Emotional Impact
- Pacing Quality
- Dialogue Quality
- Quotability
- Relatability

### 3. Video Generation Pipeline

Automated video creation workflow:

```
Script → Scene Parsing → Parallel Generation:
├── Visual Generation (Gemini 3 Pro Image)
└── Audio Generation (OpenAI TTS)
→ FFmpeg WASM Assembly → Final Video
```

### 4. A/B Testing

Scientific testing of script variations:

- Create test hypotheses
- Generate multiple variants
- Compare predicted metrics
- Declare winners

### 5. Version Branching

Git-like version control for scripts:

- Create branches from any version
- Switch between branches
- Merge branches with diff preview
- Auto-versioning on significant changes

---

## Security

MiniDrama implements **production-grade security**:

- **100% RLS Coverage** - All database tables protected
- **Multi-Layer Admin Protection** - Client + server validation
- **2FA Support** - TOTP-based authentication for admins
- **PII Masking** - GDPR/CCPA compliant logging
- **Rate Limiting** - Abuse prevention on all endpoints
- **Input Sanitization** - XSS and injection prevention
- **Content Filtering** - Prohibited content detection
- **Audit Logging** - Complete admin action trail

See [Security Documentation](docs/SECURITY-HARDENING.md) for details.

---

## Database Schema

### Core Tables (23 Total)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles & preferences |
| `scripts` | Generated scripts |
| `script_versions` | Version history |
| `script_branches` | Branch management |
| `series` | Multi-episode series |
| `video_projects` | Video generation projects |
| `video_scenes` | Individual scenes |
| `video_assets` | Generated media |
| `predictions_history` | AI predictions |
| `ab_tests` | A/B test configs |
| `ab_test_variants` | Test variants |
| `subscribers` | Subscription data |
| `trending_topics` | Trending content |
| `admin_roles` | Admin access control |
| `admin_audit_log` | Security audit trail |

---

## Edge Functions

### 40+ Serverless Functions

**Script Operations:**
- `generate-script` - AI script generation
- `analyze-script` - Script analysis
- `save-script` - Save to database
- `get-user-scripts` - Fetch scripts

**Video Operations:**
- `generate-video-project` - Create project
- `generate-scene-visuals` - Image generation
- `generate-scene-audio` - TTS generation

**AI Integration:**
- `ai-generate` - Unified AI endpoint

**Admin Functions:**
- `verify-admin-access` - Admin verification
- `admin-get-users` - User management
- `admin-get-content` - Content moderation

**Security Functions:**
- `login-rate-limit` - Rate limiting
- `security-monitor` - Event monitoring
- `admin-2fa` - 2FA management

See [Architecture Documentation](docs/ARCHITECTURE.md) for complete list.

---

## Testing

### Unit Tests (Vitest)

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npx playwright test

# Run specific test
npx playwright test auth.spec.ts

# UI mode
npx playwright test --ui
```

### Security Tests

```bash
# Run security regression tests
node scripts/security-tests.js
```

---

## Deployment

### Lovable Platform

The application is configured for deployment via the [Lovable Platform](https://lovable.dev):

1. Push changes to the repository
2. Lovable automatically builds and deploys
3. Access via Lovable project URL or custom domain

### Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Follow DNS configuration instructions

---

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure security scan passes
4. Submit PR for review
5. Merge after approval

### Code Standards

- TypeScript strict mode
- ESLint security rules
- Component files < 150 lines
- Pure functions for business logic
- Shared utilities for common patterns

### Commit Convention

```
type(scope): description

feat(scripts): add batch analysis feature
fix(auth): resolve token refresh issue
docs(readme): update installation steps
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI assistant context |
| [AGENTS.md](AGENTS.md) | Multi-agent documentation |
| [GEMINI.md](GEMINI.md) | Gemini AI integration |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [ROADMAP.md](ROADMAP.md) | Development roadmap |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/SECURITY-HARDENING.md](docs/SECURITY-HARDENING.md) | Security measures |
| [docs/AI-INTEGRATION.md](docs/AI-INTEGRATION.md) | AI service integration |
| [docs/VIDEO-GENERATION.md](docs/VIDEO-GENERATION.md) | Video pipeline |

---

## License

Proprietary - All Rights Reserved

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/tiktok-story-ai/issues)
- **Documentation:** See `/docs` folder
- **Security:** security@minidrama.app

---

**Built with Lovable** - The AI-native development platform
