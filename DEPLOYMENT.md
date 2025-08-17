# Deployment Guide

This React application is built with Vite and uses Supabase for backend services. Here's how to deploy it properly.

## Quick Fixes Applied

### 1. SPA Routing Fixed
- ✅ Added `vercel.json` for Vercel deployments
- ✅ Added `public/_redirects` for Netlify deployments  
- ✅ Updated Vite config with proper build settings

### 2. Authentication Flow Fixed
- ✅ Fixed redirect loops between `/` and `/auth`
- ✅ Updated login to redirect to `/dashboard` instead of `/`
- ✅ Removed hardcoded Azure Static Apps URLs
- ✅ Made redirect URLs dynamic based on current domain

### 3. Navigation Fixed
- ✅ Header logo now navigates to `/dashboard` for authenticated users
- ✅ All navigation links properly configured

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Vercel will automatically detect it's a Vite React app
3. Deploy - the `vercel.json` file will handle SPA routing
4. No additional environment variables needed (Supabase config is hardcoded)

### Option 2: Netlify
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The `_redirects` file will handle SPA routing
5. No additional environment variables needed

### Option 3: Other Static Hosts
For other platforms (GitHub Pages, Firebase Hosting, etc.):
1. Run `npm run build` 
2. Upload the `dist/` folder contents
3. Configure the server to serve `index.html` for all routes (SPA routing)

## Environment Variables

The Supabase configuration is currently hardcoded in `src/integrations/supabase/client.ts`. If you want to use environment variables instead:

1. Update `client.ts` to use:
   ```typescript
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
   const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

2. Set these environment variables in your deployment platform:
   - `VITE_SUPABASE_URL=https://aughkdwuvkgigczkfozp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Supabase Edge Functions

The following environment variables need to be set in your Supabase project dashboard under Settings > Edge Functions > Secrets:

- `OPENAI_API_KEY` - For AI script generation
- `STRIPE_SECRET_KEY` - For payment processing  
- `RESEND_API_KEY` - For email notifications
- `OWNER_EMAIL` - For registration notifications
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations

## Build Verification

Test your build locally:
```bash
npm install
npm run build
npm run preview
```

## Common Issues & Solutions

### 1. "Page Not Found" on Direct URL Access
- **Cause**: Server not configured for SPA routing
- **Solution**: Ensure `vercel.json` or `_redirects` file is properly deployed

### 2. Authentication Redirects Not Working  
- **Cause**: Hardcoded redirect URLs or CORS issues
- **Solution**: Check that redirect URLs are dynamic and match your domain

### 3. Dashboard Shows Loading Forever
- **Cause**: Authentication state not properly initialized
- **Solution**: Check browser console for errors, ensure Supabase config is correct

### 4. Links Broken After Login
- **Cause**: Navigation state issues or missing route protection
- **Solution**: Verify all routes are defined in `App.tsx` and auth guards are working

## Testing Deployment

After deployment, test these flows:
1. ✅ Direct URL access to `/dashboard`, `/auth`, etc.
2. ✅ Login → should redirect to `/dashboard`
3. ✅ Logout → should redirect to `/auth`  
4. ✅ Protected routes redirect unauthenticated users to `/auth`
5. ✅ All navigation links work correctly

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify network requests in DevTools
3. Ensure Supabase project is active and configured
4. Check that all required environment variables are set