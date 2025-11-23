# 🌐 Subdomain Setup Guide: app.brightnest.com

This guide will help you set up two separate domains for your BrightNest platform:
- **joinbrightnest.com** - Marketing site (homepage, blog, about, tools)
- **app.brightnest.com** - App platform (admin, closers, affiliates dashboards)

---

## ✅ What's Already Done (In Code)

- ✅ Middleware for automatic redirects between domains
- ✅ Cross-domain session/cookie sharing
- ✅ Route protection (marketing vs app routes)
- ✅ Vercel configuration

---

## 🚀 Step-by-Step Setup

### **Step 1: Create New Vercel Project for App Domain**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New" → "Project"**
3. **Select your existing GitHub repo**: `brightnest-financial-quiz`
4. **Configure the project:**
   - **Project Name**: `brightnest-app`
   - **Framework**: Next.js
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables** (copy from your main project):
   ```
   DATABASE_URL=...
   JWT_SECRET=...
   JWT_EXPIRES_IN=7d
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   OPENAI_API_KEY=...
   NODE_ENV=production
   NEXT_PUBLIC_MAIN_DOMAIN=joinbrightnest.com
   NEXT_PUBLIC_APP_DOMAIN=app.brightnest.com
   COOKIE_DOMAIN=.brightnest.com
   ```

6. **Click "Deploy"**

---

### **Step 2: Set Up DNS for app.brightnest.com**

You need to add a DNS record for the subdomain.

**Where to do this**: Your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)

#### **If using Vercel DNS:**

1. Go to your main project: `brightnest` (joinbrightnest.com)
2. Click **"Settings" → "Domains"**
3. Vercel will show you your nameservers

#### **DNS Record to Add:**

**Type**: `CNAME`
**Name**: `app` (or `app.brightnest.com` depending on your registrar)
**Value**: `cname.vercel-dns.com.`
**TTL**: Automatic or 3600

**Example:**
```
Type    Name    Value                    TTL
CNAME   app     cname.vercel-dns.com.    Auto
```

---

### **Step 3: Add Custom Domain in Vercel**

1. **Go to your NEW Vercel project** (`brightnest-app`)
2. **Click "Settings" → "Domains"**
3. **Click "Add Domain"**
4. **Enter**: `app.brightnest.com`
5. **Click "Add"**

Vercel will:
- ✅ Verify DNS configuration
- ✅ Issue SSL certificate (automatic)
- ✅ Point domain to your deployment

**Wait 5-10 minutes** for DNS to propagate.

---

### **Step 4: Update Main Project Domain Settings**

1. **Go to your MAIN Vercel project** (joinbrightnest.com)
2. **Settings → "Domains"**
3. **Verify these domains are configured:**
   - `joinbrightnest.com` (primary)
   - `www.joinbrightnest.com` (redirect to primary)

---

### **Step 5: Update Environment Variables in BOTH Projects**

**Main Project** (joinbrightnest.com):
```env
NEXT_PUBLIC_MAIN_DOMAIN=joinbrightnest.com
NEXT_PUBLIC_APP_DOMAIN=app.brightnest.com
COOKIE_DOMAIN=.brightnest.com
```

**App Project** (app.brightnest.com):
```env
NEXT_PUBLIC_MAIN_DOMAIN=joinbrightnest.com
NEXT_PUBLIC_APP_DOMAIN=app.brightnest.com
COOKIE_DOMAIN=.brightnest.com
```

**Important**: Both projects need the SAME environment variables so they can share sessions!

---

### **Step 6: Redeploy Both Projects**

After adding environment variables:

1. **Main project** → "Deployments" → "Redeploy" (latest)
2. **App project** → "Deployments" → "Redeploy" (latest)

---

## 🧪 Testing Your Setup

### **Test 1: Basic Domain Access**

- ✅ Visit `https://joinbrightnest.com` → Should show marketing homepage
- ✅ Visit `https://app.brightnest.com` → Should redirect to `/admin/dashboard`

### **Test 2: Automatic Redirects**

- ✅ Visit `https://joinbrightnest.com/admin` → Should redirect to `https://app.brightnest.com/admin`
- ✅ Visit `https://app.brightnest.com/blog` → Should redirect to `https://joinbrightnest.com/blog`

### **Test 3: Cross-Domain Sessions**

1. Log in to admin at `https://app.brightnest.com/admin`
2. Open `https://joinbrightnest.com` in the same browser
3. Check if your session is recognized (API calls should work)

### **Test 4: Affiliate Tracking**

1. Visit `https://joinbrightnest.com/PARTNER123`
2. Complete quiz
3. Book call
4. Verify affiliate tracking works across domains

---

## 🔧 Local Development Setup

To test subdomain routing locally:

### **Update /etc/hosts** (Mac/Linux)

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1  localhost
127.0.0.1  app.localhost
```

### **Run Development Server**

```bash
npm run dev
```

**Test locally:**
- `http://localhost:3000` → Marketing site
- `http://app.localhost:3000` → App platform

---

## 📊 Route Distribution

### **Marketing Domain** (joinbrightnest.com)

**Public Pages:**
- `/` - Homepage
- `/about` - About page
- `/blog` - Blog
- `/faq` - FAQ
- `/tools/*` - Calculators
- `/partners/*` - Partner program
- `/privacy` - Privacy policy
- `/terms` - Terms of service

**Conversion Pages:**
- `/quiz` - Quiz (leads to app)
- `/book-call` - Calendly booking
- `/[affiliateCode]` - Affiliate landing pages

**Auth Pages:**
- `/affiliates` - Affiliate login
- `/affiliates/signup` - Affiliate signup
- `/closers/login` - Closer login
- `/closers/signup` - Closer signup

### **App Domain** (app.brightnest.com)

**Admin:**
- `/admin/*` - All admin routes

**Closers:**
- `/closers/dashboard` - Closer dashboard
- `/closers/leads/*` - Lead management
- `/closers/tasks` - Tasks
- `/closers/rules` - Scripts & rules

**Affiliates:**
- `/affiliates/dashboard` - Affiliate dashboard
- `/affiliates/links` - Link management
- `/affiliates/payouts` - Payouts
- `/affiliates/profile` - Profile

---

## 🔒 Security & Sessions

### **Cross-Domain Cookies**

Cookies are set with `domain=.brightnest.com` which means:
- ✅ Works on `joinbrightnest.com`
- ✅ Works on `app.brightnest.com`
- ✅ Works on any `*.brightnest.com` subdomain

### **Session Sharing**

Both domains share:
- Authentication tokens (JWT)
- Affiliate tracking codes
- Quiz session IDs
- User preferences

### **CORS Configuration**

API routes accept requests from both domains:
- `https://joinbrightnest.com`
- `https://app.brightnest.com`

---

## 🐛 Troubleshooting

### **Issue: DNS not resolving**
**Solution**: Wait 5-15 minutes for DNS propagation. Clear browser DNS cache:
```bash
# Mac
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns
```

### **Issue: Redirect loop**
**Solution**: Check middleware logic. Ensure environment variables are set correctly in both projects.

### **Issue: Session not shared**
**Solution**: 
1. Verify `COOKIE_DOMAIN=.brightnest.com` is set in BOTH projects
2. Check cookies in browser DevTools (Application → Cookies)
3. Ensure both domains use HTTPS (cookies with secure flag)

### **Issue: 404 on app.brightnest.com**
**Solution**: Redeploy the app project after DNS is configured and verified.

---

## 📈 Benefits of This Setup

✅ **SEO**: Marketing site is clean and indexable
✅ **Performance**: Separate deployments can be optimized independently
✅ **Security**: Admin/app routes isolated from public site
✅ **Professional**: `app.brightnest.com` looks more credible
✅ **Scalability**: Can scale app platform independently
✅ **Analytics**: Separate tracking for marketing vs app usage

---

## 🎯 Next Steps After Setup

1. **Update Google Search Console**: Add `app.brightnest.com` as new property (don't index it though!)
2. **Update Analytics**: Set up separate GA4 properties for marketing vs app
3. **Update Links**: Change any hardcoded links in emails/docs
4. **Test Thoroughly**: Go through entire user flow (quiz → book call → admin)
5. **Monitor Logs**: Check Vercel logs for any redirect or auth issues

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify DNS configuration in your registrar
3. Test in incognito mode (clears cookies)
4. Check browser console for errors

Remember: DNS changes can take up to 24 hours to fully propagate worldwide, but usually work within 10-15 minutes.

