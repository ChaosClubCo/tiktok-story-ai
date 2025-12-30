# Changelog

All notable changes to MiniDrama AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Real-time collaboration features
- Mobile application
- API marketplace
- Advanced video editing

---

## [1.0.0] - 2025-12-30

### Added - Core Platform

#### Script Generation
- AI-powered script generation with OpenAI GPT-4o-mini
- Multiple script modes: Standard, POV Skit, AI Storytime
- Hook variations generation for A/B testing
- Beat markers for video editing synchronization
- TTS optimization for AI storytime mode
- Fiction disclaimers for generated content
- Content safety filtering with prohibited keyword detection

#### Viral Score Prediction
- 10-point scoring system (viral, engagement, shareability, etc.)
- AI-powered analysis with recommendations
- Strengths and weaknesses identification
- Prediction history tracking
- Niche-based performance analysis

#### Video Generation Pipeline
- Automated video project creation from scripts
- Scene-by-scene parsing and generation
- AI image generation via Gemini 3 Pro Image
- Text-to-speech audio via OpenAI TTS
- Browser-based video assembly with FFmpeg WASM
- Multiple voice options and transition effects
- Aspect ratio support (9:16 for TikTok)

#### A/B Testing Framework
- Test creation with hypothesis documentation
- Multiple variant support per test
- Score tracking across all metrics
- Winner selection and result analysis
- Integration with script versioning

#### Version Control System
- Git-like branching for scripts
- Branch creation from any version
- Branch switching with content isolation
- Merge functionality with diff preview
- Auto-versioning on significant changes

#### Analytics Dashboard
- Performance metrics visualization
- Improvement rate tracking
- Niche performance comparison
- Top scripts identification
- Export functionality (CSV, JSON, PDF, Excel)

#### Series Management
- Multi-episode series creation
- Episode tracking and ordering
- Series templates and suggestions
- Remix functionality

### Added - User Features

#### Authentication
- Email/password authentication
- Magic link support
- Google OAuth integration
- Apple OAuth integration
- Password reset with environment-aware URLs
- Session persistence with auto-refresh

#### Onboarding
- Multi-step onboarding flow
- Niche preference selection
- Goals configuration
- Email verification reminders

#### User Settings
- Profile management
- Password change
- Notification preferences
- Linked accounts management
- Session management
- Two-factor authentication (TOTP)
- Account deletion (GDPR compliant)

### Added - Admin Features

#### Admin Dashboard
- User management interface
- Content moderation tools
- Security monitoring dashboard
- API key rotation

#### Admin Security
- Two-factor authentication (TOTP)
- Role-based access control (super_admin, support_admin, content_moderator)
- Comprehensive audit logging
- Login activity tracking

### Added - Security Hardening

#### Authentication Security
- Server-side rate limiting on login
- Math CAPTCHA after failed attempts
- JWT token verification
- Admin route protection (client + server)

#### Data Protection
- 100% Row-Level Security coverage (23 tables)
- PII masking in all logs
- Input sanitization and validation
- Content Security Policy headers
- XSS prevention measures

#### Rate Limiting
- Per-user limits on generation endpoints
- IP-based limits on public endpoints
- Configurable windows and thresholds
- 429 responses with Retry-After headers

#### Audit & Compliance
- GDPR Article 25, 32, 33 compliance
- CCPA Section 1798.100, 1798.150 compliance
- OWASP Top 10 protections
- Security event logging
- Admin action audit trail

### Added - Infrastructure

#### Backend (Supabase)
- 40+ Edge Functions
- PostgreSQL database with RLS
- Shared utilities for edge functions
- CORS configuration
- Error handling standardization

#### Frontend
- React 18 with TypeScript
- Vite build system with PWA support
- shadcn/ui component library
- Tailwind CSS styling
- Code splitting and lazy loading
- Error boundaries

#### CI/CD
- GitHub Actions security workflow
- Dependency vulnerability scanning
- Secret detection (TruffleHog)
- Security regression tests
- License compliance checking

### Added - Integrations

- **Stripe** - Subscription management
- **PostHog** - Product analytics
- **OpenAI** - Script generation and TTS
- **Lovable AI Gateway** - Unified AI access
- **Web Vitals** - Performance monitoring

---

## [0.9.0] - 2025-12-11

### Added
- Security alerts system implementation
- Enhanced login rate limiting with CAPTCHA
- Subscribers RLS policies refinement

### Security
- Login rate limit CAPTCHA integration
- Security monitoring improvements

---

## [0.8.0] - 2025-11-26

### Added
- Comprehensive security hardening
- PII masking across all edge functions
- Public endpoint rate limiting
- Content Security Policy implementation

### Changed
- Refactored analytics module into components
- Created shared edge function utilities
- Improved error handling standardization

### Security
- Fixed XSS vulnerability in chart components
- Implemented input sanitization utilities
- Added security monitoring hooks

---

## [0.7.0] - 2025-11-17

### Added
- A/B Testing database schema and edge functions
- Version branching system
- Auto-versioning hook
- Diff utilities for merge preview
- Analytics export functionality (backend)

### Changed
- Major codebase refactoring
- Reduced Analytics.tsx from 477 to 155 lines
- Created 15 focused component files

### Fixed
- TypeScript compiler stack overflow prevention
- Heavy library import optimization

---

## [0.6.0] - 2025-11-10

### Added
- Admin panel with user management
- Content moderation interface
- Admin 2FA with TOTP
- API key rotation
- Security monitoring dashboard

### Security
- Multi-layer admin route protection
- Admin audit logging
- Role-based access control

---

## [0.5.0] - 2025-11-01

### Added
- Video generation pipeline
- Scene visual generation
- TTS audio generation
- FFmpeg WASM video assembly
- Video editor interface

---

## [0.4.0] - 2025-10-20

### Added
- Series management
- Series builder flow
- Episode tracking
- Series templates

---

## [0.3.0] - 2025-10-10

### Added
- Viral score prediction
- Prediction history
- Analytics dashboard
- Niche performance tracking

---

## [0.2.0] - 2025-10-01

### Added
- Script generation with multiple modes
- POV Skit mode
- AI Storytime mode
- Script saving and management

---

## [0.1.0] - 2025-09-15

### Added
- Initial project setup
- React + TypeScript + Vite
- Supabase integration
- Authentication system
- Basic UI components
- Landing page

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2025-12-30 | Production release |
| 0.9.0 | 2025-12-11 | Security alerts |
| 0.8.0 | 2025-11-26 | Security hardening |
| 0.7.0 | 2025-11-17 | A/B testing, branching |
| 0.6.0 | 2025-11-10 | Admin panel |
| 0.5.0 | 2025-11-01 | Video generation |
| 0.4.0 | 2025-10-20 | Series management |
| 0.3.0 | 2025-10-10 | Analytics |
| 0.2.0 | 2025-10-01 | Script generation |
| 0.1.0 | 2025-09-15 | Initial setup |

---

## Migration Notes

### Upgrading to 1.0.0

No breaking changes from 0.9.x. Recommended steps:

1. Run `npm install` to update dependencies
2. Apply any pending database migrations
3. Verify environment variables are set
4. Test authentication flow
5. Verify admin access if applicable

### Security Recommendations

- Review all admin role assignments
- Rotate API keys if not done recently
- Check audit logs for suspicious activity
- Verify 2FA is enabled for admin accounts

---

## Contributors

- Development Team
- Security Review Team
- QA Team

---

## Links

- [README](README.md)
- [ROADMAP](ROADMAP.md)
- [Security Documentation](docs/SECURITY-HARDENING.md)
