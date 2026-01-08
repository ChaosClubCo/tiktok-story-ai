# Deployment Guide

## Overview

This application uses Lovable's integrated deployment system with Supabase backend. All deployments are managed through the Lovable platform.

## Deployment Architecture

### Frontend Deployment
- **Platform**: Lovable Deploy
- **Build Tool**: Vite
- **CDN**: Global edge network
- **SSL**: Automatic HTTPS

### Backend Deployment
- **Database**: Supabase PostgreSQL
- **Edge Functions**: Deno runtime on Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (when configured)

## Deployment Process

### Automatic Deployment

#### Backend Changes
- **Edge functions**: Auto-deploy on code push
- **Database migrations**: Auto-apply on deployment
- **Secrets**: Managed through Supabase dashboard

#### Frontend Changes
- Click **"Publish"** button in Lovable interface
- Review changes in preview
- Click **"Update"** to deploy to production
- Changes are live within seconds

### Manual Deployment Steps

1. **Test Locally**
   - Run `npm run dev` to test changes
   - Verify all features work correctly
   - Check console for errors

2. **Commit Changes**
   - Review all modified files
   - Ensure no sensitive data in code
   - Commit with descriptive message

3. **Deploy Frontend**
   - Click "Publish" button (top right or bottom right on mobile)
   - Review deployment preview
   - Click "Update" to go live

4. **Verify Deployment**
   - Check production URL
   - Test critical user flows
   - Monitor edge function logs

## Environment Configuration

### Supabase Environment Variables

These are automatically configured in edge functions:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Custom Secrets

Managed through Supabase dashboard:
- `LOVABLE_API_KEY` - Lovable AI Gateway access
- `OPENAI_API_KEY` - OpenAI API access
- `ELEVENLABS_API_KEY` - ElevenLabs API access
- `STRIPE_SECRET_KEY` - Stripe payments
- `RESEND_API_KEY` - Email service

### Adding New Secrets

1. Go to Supabase dashboard
2. Navigate to Settings → Edge Functions
3. Add new secret with name and value
4. Reference in edge functions: `Deno.env.get('SECRET_NAME')`

## Custom Domain Setup

### Prerequisites
- Paid Lovable plan
- Domain with DNS access

### Steps
1. Go to Project → Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Add DNS records provided by Lovable:
   - Type: CNAME
   - Name: subdomain (or @)
   - Value: provided by Lovable
5. Wait for DNS propagation (5-60 minutes)
6. SSL certificate is automatically provisioned

### DNS Configuration Examples

#### Subdomain (app.yourdomain.com)
```
Type: CNAME
Name: app
Value: [provided-by-lovable].lovable.app
```

#### Root Domain (yourdomain.com)
```
Type: ALIAS or CNAME (depending on DNS provider)
Name: @
Value: [provided-by-lovable].lovable.app
```

## Database Migrations

### Creating Migrations

Database changes are handled through the AI assistant:
1. Describe needed database changes
2. AI generates SQL migration
3. Review and approve migration
4. Migration auto-applies on deployment

### Migration Best Practices

✅ **Do**:
- Test migrations on development database first
- Include rollback instructions
- Make incremental changes
- Document complex migrations

❌ **Don't**:
- Drop tables without backing up data
- Make breaking schema changes without versioning
- Skip RLS policy updates
- Ignore migration warnings

### Manual Migration (if needed)

1. Go to Supabase SQL Editor
2. Write SQL commands
3. Run migration
4. Verify changes
5. Document in `supabase/migrations/`

## Edge Function Deployment

### Automatic Deployment
- Triggered on code push to Lovable
- All functions in `supabase/functions/` are deployed
- Config from `supabase/config.toml` is applied

### Verifying Deployment

1. Check function logs:
   - Supabase Dashboard → Edge Functions → [function-name] → Logs

2. Test endpoint:
   ```bash
   curl -X POST \
     https://[project-id].supabase.co/functions/v1/[function-name] \
     -H "Authorization: Bearer [anon-key]" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### Common Deployment Issues

#### Function Not Found (404)
- **Cause**: Function not deployed or wrong name
- **Fix**: Check `supabase/config.toml` has function entry

#### Unauthorized (401)
- **Cause**: Missing or invalid JWT token
- **Fix**: Set `verify_jwt = false` for public functions or include valid token

#### Internal Server Error (500)
- **Cause**: Runtime error in function
- **Fix**: Check function logs for error details

## Rollback Strategy

### Frontend Rollback
Lovable maintains deployment history:
1. Go to Project → Settings → Deployments
2. Select previous deployment
3. Click "Restore"

### Backend Rollback

#### Edge Functions
1. Revert code changes
2. Push to Lovable
3. Redeploy

#### Database
1. Create rollback migration
2. Apply using SQL Editor
3. Verify data integrity

## Performance Optimization

### Frontend
- Enable production build optimizations (automatic)
- Use code splitting for large features
- Lazy load images and heavy components
- Minimize bundle size

### Backend
- Optimize database queries with indexes
- Use connection pooling
- Implement caching where appropriate
- Monitor and optimize slow queries

### Edge Functions
- Minimize cold start times
- Use shared utilities to reduce code size
- Implement timeouts for external API calls
- Cache frequent database queries

## Monitoring & Logging

### Supabase Dashboard

#### Database Metrics
- Query performance
- Connection pool usage
- Table sizes
- Active connections

#### Edge Function Logs
- Request/response logs
- Error traces
- Performance metrics
- Invocation counts

### Custom Monitoring

Add logging to edge functions:
```typescript
console.log('Function invoked:', {
  timestamp: new Date().toISOString(),
  userId: user.id,
  action: 'generate_video',
});
```

### Log Retention
- Edge function logs: 7 days
- Database logs: 7 days
- Audit logs: 90 days

## Security Considerations

### Pre-Deployment Checklist

- [ ] No secrets in code
- [ ] RLS policies enabled on all tables
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] CORS headers properly set
- [ ] Authentication required where needed
- [ ] Admin routes protected
- [ ] Error messages don't leak sensitive data

### Post-Deployment Verification

1. Test authentication flows
2. Verify RLS policies work correctly
3. Check admin access is restricted
4. Test rate limiting
5. Scan for exposed secrets
6. Review security headers

## Troubleshooting

### Build Failures

#### TypeScript Errors
```
error TS2322: Type 'X' is not assignable to type 'Y'
```
**Fix**: Review type definitions, ensure compatibility

#### Missing Dependencies
```
Cannot find module 'X'
```
**Fix**: Run `npm install X`, commit package.json

### Runtime Errors

#### CORS Issues
**Symptom**: Browser blocks requests
**Fix**: Add CORS headers in edge functions:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

#### Database Connection Issues
**Symptom**: "Cannot connect to database"
**Fix**: 
- Check database is running
- Verify connection string
- Check RLS policies
- Review database logs

### Performance Issues

#### Slow Page Loads
- Check bundle size
- Enable lazy loading
- Optimize images
- Review network requests

#### Slow Edge Functions
- Add database indexes
- Optimize queries
- Implement caching
- Check external API latency

## CI/CD Integration

### GitHub Integration

1. Connect GitHub account in Lovable
2. Enable auto-sync
3. Changes to main branch auto-deploy
4. Use branches for feature development

### Best Practices
- Use feature branches for development
- Test on preview deployments
- Merge to main for production
- Tag releases for tracking

## Backup & Recovery

### Database Backups

Supabase provides automatic backups:
- Daily backups (retained 7 days)
- Point-in-time recovery
- Manual backup export available

### Creating Manual Backup

1. Go to Supabase Dashboard
2. Database → Backups
3. Click "Download Backup"
4. Store securely

### Restoring from Backup

1. Contact Supabase support
2. Provide backup timestamp
3. Confirm restoration
4. Verify data after restore

## Cost Optimization

### Free Tier Limits
- Database: 500 MB
- Edge Functions: 500K requests/month
- Bandwidth: 2 GB/month

### Optimization Strategies
- Implement query caching
- Optimize database queries
- Use efficient AI models
- Monitor usage regularly
- Clean up unused data

### Scaling Considerations

When approaching limits:
1. Upgrade Supabase plan
2. Optimize heavy queries
3. Implement pagination
4. Use CDN for assets
5. Archive old data

## Support & Resources

### Documentation
- Lovable Docs: https://docs.lovable.dev
- Supabase Docs: https://supabase.com/docs

### Community
- Lovable Discord: [link]
- Supabase Discord: [link]

### Support Channels
- Lovable Support: support@lovable.dev
- Supabase Support: Via dashboard
