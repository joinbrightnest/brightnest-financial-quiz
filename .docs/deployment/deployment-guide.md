# Deployment Guide - Microservices Architecture

## Quick Start

Ai creat cu succes o arhitectură de microservicii! Acum trebuie să configurezi Vercel pentru a deploy-a ambele aplicații independent.

## Prerequisites

✅ Ai 2 proiecte în Vercel:
- `brightnest` (marketing)
- `brightnest-app` (admin/dashboards)

✅ Ambele sunt conectate la același repository GitHub

✅ Ambele aplicații build-uiesc cu succes local

## Step 1: Configurare Marketing Site (brightnest)

### 1.1 Accesează Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Select project: **brightnest**

### 1.2 Set Root Directory
- Go to: **Settings → General**
- Scroll to: **Root Directory**
- Click: **Edit**
- Set to: `apps/marketing`
- Click: **Save**

### 1.3 Configure Environment Variables
- Go to: **Settings → Environment Variables**
- Add următoarele variabile (folosește valorile reale din `.env` actual):

```
DATABASE_URL=<your-database-url>
DIRECT_URL=<your-direct-url>
NEXT_PUBLIC_APP_URL=https://app.joinbrightnest.com
CALENDLY_WEBHOOK_SECRET=<your-calendly-secret>
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=brightnest-marketing
```

### 1.4 Verify Build Settings
- Go to: **Settings → Build & Development Settings**
- Verify:
  - **Build Command**: `npm run build` ✓
  - **Output Directory**: `.next` ✓
  - **Install Command**: `npm install` ✓

## Step 2: Configurare App Platform (brightnest-app)

### 2.1 Accesează Vercel Dashboard
- Select project: **brightnest-app**

### 2.2 Set Root Directory
- Go to: **Settings → General**
- Scroll to: **Root Directory**
- Click: **Edit**
- Set to: `apps/app`
- Click: **Save**

### 2.3 Configure Environment Variables
- Go to: **Settings → Environment Variables**
- Add următoarele variabile:

```
DATABASE_URL=<your-database-url>
DIRECT_URL=<your-direct-url>
NEXT_PUBLIC_MARKETING_URL=https://joinbrightnest.com
ADMIN_JWT_SECRET=<your-admin-jwt-secret>
JWT_SECRET=<your-jwt-secret>
ADMIN_PASSWORD=<your-admin-password>
UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
OPENAI_API_KEY=<your-openai-key>
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=brightnest-app
```

### 2.4 Verify Build Settings
- Go to: **Settings → Build & Development Settings**
- Verify:
  - **Build Command**: `npm run build` ✓
  - **Output Directory**: `.next` ✓
  - **Install Command**: `npm install` ✓

### 2.5 Verify Cron Jobs
- Go to: **Settings → Cron Jobs**
- Should see: `/api/auto-release-commissions` (every 6 hours)
- This is configured in `apps/app/vercel.json`

## Step 3: Deploy

### 3.1 Commit și Push Changes

```bash
cd /Users/stefantudosescu/birghtnest

# Add new files
git add apps/
git add MONOREPO-README.md

# Commit
git commit -m "feat: migrate to microservices architecture

- Separate marketing site and app platform
- Independent deployments on Vercel
- Shared database pattern
- Fault isolation between services"

# Push to GitHub
git push origin main
```

### 3.2 Monitor Deployments

Vercel va detecta automat push-ul și va deploy-a **AMBELE** proiecte:

1. **brightnest** va build-ui din `apps/marketing/`
2. **brightnest-app** va build-ui din `apps/app/`

Monitor în Vercel dashboard:
- https://vercel.com/dashboard

## Step 4: Verification

### 4.1 Check Marketing Site
- Visit: https://joinbrightnest.com
- Test:
  - ✓ Homepage loads
  - ✓ Start quiz
  - ✓ Complete quiz flow
  - ✓ See results
  - ✓ Affiliate link: https://joinbrightnest.com/TESTCODE

### 4.2 Check App Platform
- Visit: https://app.joinbrightnest.com
- Test:
  - ✓ Redirects to `/admin/dashboard`
  - ✓ Admin login works
  - ✓ Dashboard shows stats
  - ✓ CRM loads
  - ✓ Quiz editor accessible

### 4.3 Check Cross-Service Communication
- ✓ Marketing can track bookings
- ✓ App can access quiz results
- ✓ Both use same database
- ✓ No conflicts

## Troubleshooting

### Build Fails

**Problem**: Build fails with "Module not found"
**Solution**: 
- Check that Root Directory is set correctly
- Verify all files were committed and pushed

**Problem**: Build fails with "Environment variable missing"
**Solution**:
- Check all environment variables are set in Vercel
- Make sure to use real values, not placeholders

### Deployment Issues

**Problem**: Old site still showing
**Solution**:
- Clear browser cache
- Wait 1-2 minutes for CDN propagation
- Check deployment logs in Vercel

**Problem**: 404 errors on routes
**Solution**:
- Verify Root Directory is correct
- Check that routes exist in the correct app

## Rollback Plan

Dacă ceva nu merge, poți reveni la configurația veche:

### Quick Rollback

1. **În Vercel pentru brightnest**:
   - Settings → General → Root Directory
   - Remove the root directory (leave empty)
   - Save

2. **În Vercel pentru brightnest-app**:
   - Settings → General → Root Directory
   - Remove the root directory (leave empty)
   - Save

3. **Redeploy**:
   - Go to Deployments
   - Find last working deployment
   - Click "..." → Promote to Production

## Success Criteria

✅ Marketing site loads at `joinbrightnest.com`  
✅ App platform loads at `app.joinbrightnest.com`  
✅ Both can be deployed independently  
✅ If one fails, the other continues working  
✅ Database shared between both  
✅ All features working as before  

## Next Steps

După deployment success:

1. **Monitor Performance**
   - Check Sentry for errors
   - Monitor Vercel analytics
   - Watch database connections

2. **Test Thoroughly**
   - Run through all user flows
   - Test admin operations
   - Verify affiliate tracking

3. **Update Documentation**
   - Update team on new structure
   - Document any issues found
   - Create runbook for common tasks

## Support

Dacă întâmpini probleme:

1. Check deployment logs în Vercel
2. Check Sentry pentru runtime errors
3. Verify environment variables
4. Test locally first: `cd apps/marketing && npm run dev`

---

**Gata! Ai migrat cu succes la microservicii! 🎉**
