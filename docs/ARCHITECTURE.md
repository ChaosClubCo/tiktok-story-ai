# Architecture Documentation

## System Overview

This application is a comprehensive AI-powered script and video generation platform built on React, TypeScript, Vite, Tailwind CSS, and Supabase. The system enables users to create, analyze, and generate videos from scripts using state-of-the-art AI models.

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Component library
- **React Router**: Client-side routing
- **TanStack Query**: Server state management
- **Framer Motion**: Animations

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Edge Functions (Deno runtime)
  - Authentication
  - Real-time subscriptions

### AI Integration
- **Lovable AI Gateway**: Unified AI access
  - Google Gemini models (image, chat)
  - OpenAI models (audio, chat)
- **FFmpeg WASM**: Browser-based video rendering

## Project Structure

```
project-root/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── shared/         # Shared components
│   │   └── [feature]/      # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   └── ai/            # AI integration
│   ├── pages/              # Route pages
│   ├── integrations/       # External integrations
│   │   └── supabase/      # Supabase client & types
│   └── main.tsx           # Application entry
├── supabase/
│   ├── functions/          # Edge functions
│   │   └── _shared/       # Shared utilities
│   └── config.toml        # Supabase configuration
├── docs/                   # Documentation
└── public/                 # Static assets
```

## Core Features

### 1. Script Management
- Create and edit scripts
- Version control with branches
- A/B testing
- Viral score prediction
- Analytics tracking

### 2. AI Video Generation
- Script-to-scene parsing
- AI image generation (Gemini 3 Pro Image)
- AI audio generation (OpenAI TTS)
- Browser-based video assembly (FFmpeg WASM)

### 3. Series Management
- Multi-episode series creation
- Episode tracking
- Series templates

### 4. Analytics
- Performance metrics
- Niche analysis
- Trend tracking
- Export capabilities

### 5. Admin Panel
- User management
- Content moderation
- Security monitoring
- API key rotation
- **Analytics Dashboard**: Usage statistics, user metrics, API call charts
- **System Health**: Edge function status, database stats, uptime tracking

## Data Flow

### Script Creation Flow
```
User Input → ScriptWorkflow Component → generate-script Edge Function
→ Lovable AI (Gemini) → Database (scripts table) → UI Update
```

### Video Generation Flow
```
Script → generate-video-project → Scene Parsing → video_scenes table
→ Parallel Generation:
   ├─ generate-scene-visuals → Gemini 3 Pro Image → image_url
   └─ generate-scene-audio → OpenAI TTS → audio_url
→ useVideoAssembler → FFmpeg WASM → Final MP4 Video
```

### Authentication Flow
```
User Login → Supabase Auth → JWT Token → RLS Policies
→ Authorized Database Access
```

## Component Architecture

### Shared Components
- `Header`: Navigation and user menu
- `AuthRequired`: Authentication wrapper
- `LoadingSpinner`: Loading states

### Feature Components
Each feature has its own component directory:
- Self-contained business logic
- Feature-specific hooks
- Clear prop interfaces

### UI Components (Shadcn)
Customized Shadcn components with:
- Design system tokens
- Dark/light mode support
- Accessibility features

## State Management

### Local State (useState)
- Component-specific UI state
- Form inputs
- Temporary data

### Server State (TanStack Query)
- Database queries
- Edge function calls
- Automatic caching and refetching

### Context (React Context)
- Authentication state (`useAuth`)
- Theme preferences
- Global UI state

## Database Schema

### Core Tables
- `scripts`: User-generated scripts
- `script_versions`: Version history
- `script_branches`: Version control branches
- `series`: Multi-episode series
- `video_projects`: Video generation projects
- `video_scenes`: Individual video scenes
- `video_assets`: Generated media assets
- `predictions_history`: AI analysis results
- `ab_tests`: A/B testing experiments

### Security Tables
- `profiles`: User profiles
- `admin_roles`: Admin access control
- `admin_audit_log`: Security audit trail
- `login_rate_limits`: IP-based rate limiting for login attempts
- `security_alerts`: Security event notifications
- `login_activity`: User login history

## Edge Functions

### AI Generation Functions
- `ai-generate`: Unified AI endpoint
- `generate-scene-visuals`: Image generation
- `generate-scene-audio`: Audio synthesis
- `generate-script`: Script generation
- `analyze-script`: Script analysis

### Data Functions
- `get-user-scripts`: Fetch user scripts
- `get-video-projects`: Fetch video projects
- `save-script`: Save script data

### Admin Functions
- `admin-get-users`: User management
- `admin-get-content`: Content moderation
- `verify-admin-access`: Admin verification
- `rotate-api-key`: Key rotation
- `log-admin-action`: Admin audit logging

### Security Functions
- `login-rate-limit`: Progressive rate limiting with CAPTCHA support
- `send-security-alert`: Security notification emails via Resend
- `user-2fa`: User two-factor authentication
- `admin-2fa`: Admin two-factor authentication
- `get-login-activity`: Login history retrieval
- `get-security-events`: Security event logs

### Shared Utilities
- `_shared/authHelpers.ts`: Authentication
- `_shared/corsHeaders.ts`: CORS configuration
- `_shared/errorHandler.ts`: Error handling
- `_shared/aiClient.ts`: AI integration
- `_shared/rateLimit.ts`: Rate limiting utilities
- `_shared/piiMasking.ts`: PII protection in logs

## Security Architecture

### Authentication
- Supabase Auth with JWT tokens
- Email/password and OAuth support
- Session management

### Authorization
- Row Level Security (RLS) policies
- Admin role verification
- Resource ownership checks

### Data Protection
- PII masking in logs
- Input sanitization
- SQL injection prevention
- Rate limiting

### Login Security
- Progressive rate limiting (3/5/10/15 attempt thresholds)
- CAPTCHA challenges after 3 failed attempts
- IP-based blocking (30min → 1hr → 24hr escalation)
- Security alert emails for blocked logins

### Security Alerts
- Email notifications via Resend API
- Alert types: login_blocked, 2fa_enabled, 2fa_disabled, password_changed, suspicious_activity
- User-accessible alert history in Settings
- Audit logging for compliance

### Audit Logging
- Admin actions logged
- Security events tracked
- User activity monitoring
- Login attempt history

## Performance Optimization

### Frontend
- Code splitting by route
- Lazy loading components
- Image optimization
- FFmpeg WASM lazy loading

### Backend
- Edge function connection pooling
- Database query optimization
- Caching strategies
- Rate limiting

### AI Operations
- Model selection optimization
- Fallback handling
- Parallel scene generation
- Progress tracking

## Deployment Architecture

### Frontend Deployment
- Static site hosting
- CDN distribution
- Progressive Web App (PWA)

### Backend Deployment
- Supabase managed infrastructure
- Edge functions auto-deployment
- Database migrations
- Secrets management

## Error Handling

### Client-Side
- Toast notifications
- Error boundaries
- Fallback UI
- Retry mechanisms

### Server-Side
- Structured error responses
- Logging and monitoring
- Rate limit handling
- AI fallback models

## Monitoring & Observability

### Logging
- Console logs (development)
- Edge function logs
- Error tracking
- Performance metrics

### Analytics
- User engagement tracking
- Feature usage metrics
- Performance monitoring
- Error rate tracking

## Future Architecture Considerations

### Scalability
- Database sharding
- Read replicas
- Caching layers
- Queue systems

### Features
- Real-time collaboration
- Advanced video editing
- Mobile applications
- API marketplace

### Infrastructure
- Multi-region deployment
- CDN optimization
- Load balancing
- Auto-scaling
