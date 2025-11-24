# Sentry Error Monitoring Setup Guide 🐛

## What is Sentry?

**Simple Explanation:**  
Sentry is like a security camera for your code. When something breaks in production (an error happens), Sentry:
1. 📸 Takes a "photo" of the error
2. 📍 Tells you exactly where it happened
3. 🔍 Shows you what the user was doing
4. 📊 Groups similar errors together
5. 📧 Alerts you immediately

**Think of it like this:**  
- **Without Sentry:** User sees error, you have NO idea it happened
- **With Sentry:** User sees error, you get instant notification with full details

---

## How Sentry Works (ELI5)

### The Flow:
```
1. User does something on your website
   ↓
2. Code breaks (error happens)
   ↓
3. Sentry catches the error
   ↓
4. Sentry sends error details to sentry.io dashboard
   ↓
5. You get notification + see error in dashboard
   ↓
6. You fix it!
```

### What Sentry Captures:
- ✅ **Error message:** "Cannot read property 'name' of undefined"
- ✅ **Stack trace:** Exact line of code that broke
- ✅ **User context:** Which user experienced it
- ✅ **Browser info:** Chrome 120, Windows 11
- ✅ **URL:** What page they were on
- ✅ **Time:** When it happened
- ✅ **Frequency:** How many times it's happening

---

## Setup Steps (YOU NEED TO DO THIS)

### Step 1: Create Sentry Account (FREE)

1. Go to: **https://sentry.io/signup/**
2. Sign up (free tier is generous!)
3. Choose: **Next.js** as your project type
4. Name your project: **"BrightNest"**

### Step 2: Get Your DSN (Data Source Name)

After creating project, Sentry will show you a **DSN** that looks like:
```
https://abc123xyz@o123456.ingest.sentry.io/789012
```

**This is like your project's phone number** - errors call this number to report themselves.

### Step 3: Add DSN to Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these 3 variables:

```bash
# For client-side errors (browser)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/789012

# For server-side errors (API routes)
SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/789012

# Optional: For uploading source maps (helps with debugging)
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_ORG=your-org-name
SENTRY_PROJECT=brightnest
```

**Where to find these:**
- **DSN:** Sentry Dashboard → Settings → Projects → BrightNest → Client Keys (DSN)
- **Auth Token:** Sentry Dashboard → Settings → Account → API → Auth Tokens → Create New Token
- **Org:** Your organization name (shown in Sentry URL: sentry.io/organizations/**your-org-name**)
- **Project:** `brightnest` (or whatever you named it)

### Step 4: Deploy

Once you add the environment variables:
```bash
git add .
git commit -m "Add Sentry error monitoring"
git push origin main
```

Vercel will auto-deploy with Sentry enabled! 🎉

---

## What You'll See in Sentry Dashboard

### Example Error Report:

```
┌──────────────────────────────────────────────────────┐
│ TypeError: Cannot read property 'name' of undefined  │
│                                                      │
│ 📍 File: app/admin/affiliates/page.tsx              │
│ 📍 Line: 127                                         │
│                                                      │
│ 🔍 Stack Trace:                                      │
│   at AffiliatesList (page.tsx:127:15)               │
│   at renderComponent (react-dom.js:234:12)          │
│                                                      │
│ 👤 User: admin@brightnest.com                        │
│ 🌐 Browser: Chrome 120 on MacOS                      │
│ 📄 URL: /admin/affiliates                            │
│ ⏰ Time: Nov 24, 2024 3:45 PM                        │
│                                                      │
│ 📊 This has happened 15 times in the last hour      │
└──────────────────────────────────────────────────────┘
```

### You Can:
- ✅ See exactly which line of code broke
- ✅ See what the user was doing
- ✅ Group similar errors together
- ✅ Assign errors to team members
- ✅ Mark errors as resolved
- ✅ Set up alerts (Slack, email, etc.)

---

## What Sentry Monitors

### ✅ Client-Side (Browser) Errors:
```javascript
// Example: Quiz page breaks
Cannot read property 'answers' of undefined
→ Sentry captures: User was on quiz page, question #5, Chrome browser
```

### ✅ Server-Side (API) Errors:
```javascript
// Example: Database connection fails
Error: Connection refused to database
→ Sentry captures: API route /api/admin/stats, 3:45 PM, happened 20x
```

### ✅ Performance Issues:
```javascript
// Example: Slow page load
Page took 8 seconds to load
→ Sentry captures: Which page, what made it slow
```

---

## How to Use Sentry Day-to-Day

### Morning Routine (5 minutes):
1. Open https://sentry.io
2. Check "Issues" tab
3. See if any new errors appeared overnight
4. Prioritize critical ones

### When Error Occurs:
1. Sentry emails you: "New error: Cannot read property 'name'"
2. Click link in email
3. See full error details
4. Fix the bug
5. Mark as "Resolved" in Sentry

### Weekly Review:
1. Check most common errors
2. Fix top 3-5 recurring issues
3. Improves user experience over time

---

## Real-World Examples

### Example 1: Affiliate Dashboard Bug
```
Error: Cannot read property 'totalCommission' of undefined
Where: Affiliate dashboard
When: 45 times in last 24 hours
Why: New affiliate has no conversions yet, code assumes data exists

Fix: Add null check:
const commission = affiliate?.totalCommission || 0;

Result: 45 users no longer see broken dashboard
```

### Example 2: Quiz Completion Fails
```
Error: 500 Internal Server Error at /api/quiz/result
Where: Quiz result calculation
When: 3 times this week
Why: Database timeout on slow connections

Fix: Add retry logic and increase timeout

Result: 3 more users successfully complete quiz
```

### Example 3: Admin Dashboard Slow
```
Performance Issue: /admin/dashboard taking 8 seconds
Where: Admin dashboard
When: Always on mobile devices
Why: Loading 50 high-res images without optimization

Fix: Add image compression and lazy loading

Result: Dashboard loads in 2 seconds now
```

---

## Configuration Explained

### What I Set Up For You:

#### 1. **Client Config** (`sentry.client.config.ts`)
```typescript
tracesSampleRate: 0.1  // Track 10% of requests (free tier friendly)
replaysOnErrorSampleRate: 1.0  // Record 100% of sessions with errors
replaysSessionSampleRate: 0.1  // Record 10% of normal sessions
```

**What this means:**
- Sentry records 10% of normal page loads (to save quota)
- But records 100% of sessions where errors happen
- You can watch session replays (like video) to see what user did

#### 2. **Server Config** (`sentry.server.config.ts`)
```typescript
beforeSend(event) {
  // Remove sensitive data
  delete event.request.headers['authorization'];
  delete event.request.headers['cookie'];
}
```

**What this means:**
- Sentry captures errors but removes passwords, tokens, etc.
- Your users' data stays private
- You still get all debugging info you need

#### 3. **Ignored Errors**
```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',  // Browser quirk, not real error
  'cancelled',  // User navigated away, expected behavior
]
```

**What this means:**
- Some "errors" are actually normal
- We tell Sentry to ignore them so you focus on real issues

---

## Free Tier Limits

Sentry's free tier includes:
- ✅ **5,000 errors/month** - More than enough for launch
- ✅ **10,000 performance transactions/month**
- ✅ **50 session replays/month**
- ✅ **Unlimited team members**
- ✅ **90 days data retention**

**This is perfect for:**
- Soft launch (5-10 affiliates)
- First 1,000 quiz completions
- First month of operations

**You'll only need paid plan if:**
- You're getting 200+ errors per day (means your code is REALLY broken)
- You have 100,000+ users/month
- You want longer data retention

---

## Testing Sentry (After Setup)

### Test 1: Trigger an Error
```typescript
// Add this to any page temporarily
throw new Error("Test error - Sentry is working!");
```

Visit that page → Check Sentry dashboard → Should see the error!

### Test 2: Check Console
```bash
# After deploying, check Vercel logs:
# You should see: "[Sentry] Event captured and sent successfully"
```

---

## Alerts Setup (Recommended)

### Set Up Email Alerts:
1. Sentry Dashboard → Alerts → Create Alert
2. Choose: "Send email when new issue occurs"
3. Add your email
4. Save

Now you get instant email when errors happen!

### Set Up Slack Alerts (Optional):
1. Sentry Dashboard → Settings → Integrations
2. Add Slack integration
3. Choose channel (e.g., #brightnest-errors)
4. Get instant Slack notifications!

---

## Troubleshooting

### "I don't see any errors in Sentry"
**Good!** That means:
- Either everything is working perfectly ✅
- Or Sentry isn't set up yet (check DSN is added)

Test by triggering a test error (see above).

### "Too many errors!"
**Common on launch.** Prioritize:
1. Errors affecting payments/commissions (critical)
2. Errors affecting quiz flow (high)
3. UI glitches (medium)
4. Minor issues (low)

### "Sentry says 'Invalid DSN'"
- Double-check you copied full DSN (starts with `https://`)
- Make sure no extra spaces
- Verify it's in the right environment variable

---

## Privacy & Security

### What Sentry DOES capture:
- ✅ Error messages
- ✅ Stack traces (code locations)
- ✅ URLs
- ✅ Browser info
- ✅ Timestamps

### What Sentry DOESN'T capture (we configured this):
- ❌ Passwords
- ❌ JWT tokens
- ❌ Credit card numbers
- ❌ Database connection strings
- ❌ Admin passwords

**We explicitly remove sensitive data** in the `beforeSend` configuration.

---

## Benefits for Your Launch

### Before Sentry:
```
User: "Something broke!"
You: "What broke? Where? When?"
User: "I don't know, it just doesn't work"
You: "..." 😰 (Can't fix what you can't see)
```

### After Sentry:
```
User: "Something broke!"
Sentry: "Error: Cannot process payment, line 234, happened 3 times, here's the stack trace"
You: *Fixes in 10 minutes* ✅
User: "Wow, that was fast!"
```

### Real Impact:
- ✅ Fix bugs 10x faster
- ✅ Know about issues before users complain
- ✅ See which errors affect most users (prioritize)
- ✅ Build trust ("We fixed that within 1 hour!")
- ✅ Reduce support tickets

---

## Next Steps

1. **[ ] Create Sentry account** (5 min) - https://sentry.io/signup/
2. **[ ] Get your DSN** (2 min)
3. **[ ] Add to Vercel env vars** (3 min)
4. **[ ] Deploy** (automatic)
5. **[ ] Test with error** (1 min)
6. **[ ] Set up email alerts** (2 min)

**Total time: 15 minutes**  
**Value: Priceless** 🎉

---

## Support

**Sentry Documentation:** https://docs.sentry.io/platforms/javascript/guides/nextjs/

**Questions?** Check the Sentry dashboard - it's very intuitive!

---

## 🎯 Bottom Line

**Sentry = Your Platform's Guardian Angel**

It watches over your code 24/7 and tells you immediately when something breaks.

**For a platform about to onboard real users, this is ESSENTIAL.** 

Without it, you're flying blind. With it, you're in control. 🚀

---

**Setup Status:**
- ✅ Sentry installed
- ✅ Configuration files created
- ✅ Next.js integration configured
- ⚠️ **YOU NEED TO:** Add DSN to environment variables
- ⚠️ **YOU NEED TO:** Deploy to activate

**Ready to launch once you add the DSN!**

