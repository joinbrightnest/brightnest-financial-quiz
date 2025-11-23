# BrightNest Testing Checklist
**Target Capacity:** 1,000 completions/month  
**Last Updated:** November 23, 2025

## Pre-Launch Testing Checklist

### 1. Environment Configuration ✓

- [ ] **Database Connection**
  ```bash
  # Verify connection pooling
  echo $DATABASE_URL
  # Should contain: ?pgbouncer=true&connection_limit=10
  
  # Test connection
  npx prisma db execute --stdin <<< "SELECT 1 as test;"
  ```

- [ ] **Environment Variables**
  ```bash
  # Required variables
  - DATABASE_URL          ✓ 
  - DIRECT_URL            ✓ (for migrations only)
  - JWT_SECRET            ✓ 
  - ADMIN_PASSWORD        ✓ 
  - UPSTASH_REDIS_REST_URL   (optional)
  - UPSTASH_REDIS_REST_TOKEN (optional)
  - OPENAI_API_KEY        (optional)
  ```

- [ ] **Database Indexes**
  ```sql
  -- Verify all indexes exist
  SELECT 
    tablename,
    indexname,
    indexdef
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname;
  
  -- Expected indexes:
  -- quiz_sessions: affiliateCode, completedAt, status_quizType, createdAt
  -- affiliate_clicks: affiliateId_createdAt, createdAt, referralCode_createdAt
  -- appointments: closerId_outcome, affiliateCode, scheduledAt, outcome
  ```

### 2. Unit Tests ✓

```bash
npm test
```

**Expected Results:**
- ✅ `lib/scoring.test.ts` - All passing
- ✅ `lib/admin-auth-server.test.ts` - All passing  
- ✅ `lib/closer-auth.test.ts` - All passing
- ⚠️ `api/quiz/result.test.ts` - 7 tests failing (needs fix)
- ✅ `lib/rate-limit.test.ts` - All passing

**Fix Required:**
```typescript
// __tests__/api/quiz/result.test.ts
// Add assertion after session creation:
beforeEach(async () => {
  // ... create session ...
  session = await prisma.quizSession.create({...});
  
  expect(session).toBeDefined();
  expect(session.id).toBeTruthy();
  
  // ... rest of setup ...
});
```

### 3. API Endpoint Tests 🧪

#### 3.1 Quiz Flow Test

**Manual Test:**
```bash
# 1. Start quiz
curl -X POST http://localhost:3000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{"quizType":"financial-profile"}'
  
# Expected: 200 OK with sessionId and first question
# Save sessionId for next steps

# 2. Answer question
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "<SESSION_ID>",
    "questionId": "<QUESTION_ID>",
    "value": "test-answer",
    "dwellMs": 5000
  }'
  
# Expected: 200 OK with nextQuestion

# 3. Complete quiz (repeat step 2 for all questions)

# 4. Get result
curl -X POST http://localhost:3000/api/quiz/result \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "<SESSION_ID>"}'
  
# Expected: 200 OK with archetype and scores
```

**Automated Test:**
```typescript
// Create: __tests__/e2e/quiz-flow.test.ts
import { POST as startQuiz } from '@/app/api/quiz/start/route';
import { POST as answerQuestion } from '@/app/api/quiz/answer/route';
import { POST as getResult } from '@/app/api/quiz/result/route';

describe('Complete Quiz Flow', () => {
  it('should complete entire quiz successfully', async () => {
    // Start quiz
    const startRes = await startQuiz(
      new Request('http://localhost/api/quiz/start', {
        method: 'POST',
        body: JSON.stringify({ quizType: 'financial-profile' }),
      })
    );
    
    const { sessionId, question } = await startRes.json();
    expect(sessionId).toBeDefined();
    
    // Answer all questions
    let currentQuestion = question;
    while (currentQuestion) {
      const answerRes = await answerQuestion(
        new Request('http://localhost/api/quiz/answer', {
          method: 'POST',
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            value: 'test-value',
            dwellMs: 3000,
          }),
        })
      );
      
      const answerData = await answerRes.json();
      if (answerData.isComplete) break;
      currentQuestion = answerData.nextQuestion;
    }
    
    // Get result
    const resultRes = await getResult(
      new Request('http://localhost/api/quiz/result', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      })
    );
    
    const result = await resultRes.json();
    expect(result.archetype).toBeDefined();
    expect(result.scores).toBeDefined();
  });
});
```

#### 3.2 Admin Dashboard Test

```bash
# Login as admin
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"<ADMIN_PASSWORD>"}'
  
# Expected: 200 OK with token
# Save token for next requests

# Get basic stats
curl http://localhost:3000/api/admin/basic-stats?duration=30d \
  -H "Cookie: admin_token=<TOKEN>"
  
# Expected: 200 OK with stats object
# Verify: totalSessions, completedSessions, totalLeads, etc.

# Get leads
curl http://localhost:3000/api/admin/basic-stats?duration=30d \
  -H "Cookie: admin_token=<TOKEN>"
  
# Expected: 200 OK with allLeads array
# Verify: Each lead has name, email, status, source
```

#### 3.3 Affiliate Dashboard Test

```bash
# Signup as affiliate
curl -X POST http://localhost:3000/api/affiliate/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Affiliate",
    "email": "test@example.com",
    "password": "testpass123"
  }'
  
# Expected: 200 OK with referralCode

# Login
curl -X POST http://localhost:3000/api/affiliate/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
  
# Expected: 200 OK with token

# Get stats
curl http://localhost:3000/api/affiliate/stats?dateRange=30d \
  -H "Authorization: Bearer <TOKEN>"
  
# Expected: 200 OK with stats (clicks, leads, bookings, commission)
```

#### 3.4 Closer Dashboard Test

```bash
# Login as closer
curl -X POST http://localhost:3000/api/closer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "closer@example.com",
    "password": "closerpass123"
  }'
  
# Expected: 200 OK with token

# Get stats
curl http://localhost:3000/api/closer/stats \
  -H "Authorization: Bearer <TOKEN>"
  
# Expected: 200 OK with closer stats
# Verify: totalCalls, totalConversions, totalRevenue, conversionRate

# Get appointments
curl http://localhost:3000/api/closer/appointments \
  -H "Authorization: Bearer <TOKEN>"
  
# Expected: 200 OK with appointments array
```

### 4. Rate Limiting Tests 🛡️

**Test 1: Quiz Start Rate Limit (30/min)**
```bash
#!/bin/bash
# rate-limit-test.sh

echo "Testing quiz start rate limit (30 req/min)..."

for i in {1..35}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3000/api/quiz/start \
    -H "Content-Type: application/json" \
    -d '{"quizType":"financial-profile"}')
  
  echo "Request $i: HTTP $STATUS"
  
  if [ "$STATUS" = "429" ]; then
    echo "✅ Rate limit working - request $i blocked"
    exit 0
  fi
done

echo "⚠️ Rate limit not working - all 35 requests passed"
```

**Test 2: Admin Auth Rate Limit (5/15min)**
```bash
echo "Testing admin auth rate limit (5 req/15min)..."

for i in {1..7}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3000/api/admin/auth \
    -H "Content-Type: application/json" \
    -d '{"password":"wrong"}')
  
  echo "Request $i: HTTP $STATUS"
  
  if [ "$STATUS" = "429" ]; then
    echo "✅ Rate limit working - request $i blocked"
    exit 0
  fi
  
  sleep 1
done

echo "⚠️ Rate limit not working - all 7 requests passed"
```

### 5. Performance Tests 🚀

#### 5.1 Database Query Performance

```sql
-- Test 1: Quiz session lookup (should be <10ms)
EXPLAIN ANALYZE
SELECT * FROM quiz_sessions 
WHERE id = 'test-session-id';

-- Test 2: Affiliate click counting (should be <50ms)
EXPLAIN ANALYZE
SELECT COUNT(*) FROM affiliate_clicks 
WHERE affiliate_id = 'test-affiliate-id'
  AND created_at >= NOW() - INTERVAL '30 days';

-- Test 3: Lead calculation (should be <200ms)
EXPLAIN ANALYZE
SELECT qs.*, qa.value 
FROM quiz_sessions qs
JOIN quiz_answers qa ON qs.id = qa.session_id
WHERE qs.status = 'completed'
  AND qs.created_at >= NOW() - INTERVAL '30 days'
ORDER BY qs.created_at DESC
LIMIT 50;

-- Test 4: Admin stats (should be <500ms with caching)
EXPLAIN ANALYZE
SELECT 
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  AVG(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) as avg_duration
FROM quiz_sessions
WHERE created_at >= NOW() - INTERVAL '30 days';
```

#### 5.2 API Response Time Test

```bash
#!/bin/bash
# response-time-test.sh

endpoints=(
  "/api/quiz/start"
  "/api/admin/basic-stats?duration=30d"
  "/api/affiliate/stats?dateRange=30d"
  "/api/closer/stats"
)

for endpoint in "${endpoints[@]}"; do
  echo "Testing $endpoint..."
  
  time curl -s -o /dev/null \
    -w "HTTP %{http_code} - Time: %{time_total}s\n" \
    "http://localhost:3000$endpoint"
  
  echo ""
done
```

**Expected Results:**
- Quiz start: <100ms
- Admin stats: <500ms (without cache), <50ms (with cache)
- Affiliate stats: <300ms
- Closer stats: <100ms

#### 5.3 Load Test with k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '1m', target: 10 },   // Hold
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% under 2s
    http_req_failed: ['rate<0.1'],     // <10% errors
  },
};

export default function () {
  // Test quiz flow
  const startRes = http.post('http://localhost:3000/api/quiz/start', 
    JSON.stringify({ quizType: 'financial-profile' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(startRes, {
    'quiz started': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}
```

**Run test:**
```bash
k6 run load-test.js
```

**Expected Results:**
- Request duration (avg): <500ms
- Request duration (p95): <2000ms
- Failed requests: <10%
- Requests/sec: >10 (with 10 VUs)

### 6. Data Integrity Tests 🔍

```sql
-- Test 1: Check for orphaned answers
SELECT COUNT(*) FROM quiz_answers 
WHERE session_id NOT IN (SELECT id FROM quiz_sessions);
-- Expected: 0

-- Test 2: Check for sessions without answers
SELECT COUNT(*) FROM quiz_sessions 
WHERE status = 'completed' 
  AND id NOT IN (SELECT DISTINCT session_id FROM quiz_answers);
-- Expected: 0

-- Test 3: Check for duplicate answers (should be prevented by unique constraint)
SELECT session_id, question_id, COUNT(*) 
FROM quiz_answers 
GROUP BY session_id, question_id 
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Test 4: Check for appointments without closers
SELECT COUNT(*) FROM appointments 
WHERE closer_id IS NOT NULL 
  AND closer_id NOT IN (SELECT id FROM closers);
-- Expected: 0

-- Test 5: Verify affiliate click attribution
SELECT 
  a.name,
  COUNT(ac.id) as clicks,
  COUNT(DISTINCT qs.id) as sessions
FROM affiliates a
LEFT JOIN affiliate_clicks ac ON a.id = ac.affiliate_id
LEFT JOIN quiz_sessions qs ON a.referral_code = qs.affiliate_code
WHERE a.is_active = true
GROUP BY a.id, a.name
ORDER BY clicks DESC;
-- Verify: clicks >= sessions for each affiliate
```

### 7. Security Tests 🔒

**Test 1: SQL Injection Protection**
```bash
# Try SQL injection in quiz answer
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'; DROP TABLE quiz_sessions; --",
    "questionId": "test",
    "value": "test"
  }'
  
# Expected: 400/404 error, NOT 500 (database error)
```

**Test 2: Authentication Bypass**
```bash
# Try accessing admin without auth
curl http://localhost:3000/api/admin/basic-stats

# Expected: 401 Unauthorized

# Try accessing affiliate stats without token
curl http://localhost:3000/api/affiliate/stats

# Expected: 401 Unauthorized
```

**Test 3: CSRF Protection**
```bash
# Try cross-origin request without proper headers
curl -X POST http://localhost:3000/api/quiz/start \
  -H "Origin: http://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"quizType":"financial-profile"}'
  
# Expected: Should work (API is public)
# But admin endpoints should have CSRF protection
```

### 8. Browser Testing 🌐

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Test Cases:**
1. **Quiz Flow**
   - [ ] Can start quiz
   - [ ] Progress bar updates correctly
   - [ ] Questions display properly
   - [ ] Can navigate back/forward
   - [ ] Loading screens appear
   - [ ] Results page displays correctly

2. **Admin Dashboard**
   - [ ] Login works
   - [ ] Stats load correctly
   - [ ] Charts render properly
   - [ ] Leads table displays
   - [ ] Can filter by date range
   - [ ] Can export CSV

3. **Affiliate Dashboard**
   - [ ] Login/signup works
   - [ ] Stats display correctly
   - [ ] Charts render
   - [ ] Can copy referral link
   - [ ] Performance table displays

4. **Closer Dashboard**
   - [ ] Login works
   - [ ] Appointments display
   - [ ] Can update call outcomes
   - [ ] Stats calculate correctly
   - [ ] Task management works

### 9. Mobile Responsiveness 📱

**Test on:**
- [ ] iPhone 12/13/14 (375x812)
- [ ] iPhone SE (320x568)
- [ ] iPad (768x1024)
- [ ] Android Phone (360x640)
- [ ] Android Tablet (600x960)

**Check:**
- [ ] Quiz questions fit screen
- [ ] Buttons are tappable (min 44x44px)
- [ ] Text is readable (min 16px)
- [ ] No horizontal scrolling
- [ ] Navigation works
- [ ] Forms are usable

### 10. Production Deployment Checklist ✈️

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] Backup created
- [ ] Monitoring enabled (Sentry, Vercel Analytics)
- [ ] Rate limiting configured
- [ ] Admin password changed from default

**Post-Deployment:**
- [ ] Smoke test all critical paths
- [ ] Verify database connection
- [ ] Check logs for errors
- [ ] Test quiz completion end-to-end
- [ ] Verify analytics tracking
- [ ] Monitor performance for 24 hours

**Rollback Plan:**
```bash
# If issues occur:
vercel rollback

# Verify rollback
curl https://yourdomain.com/api/health
```

---

## Automated Testing Script

Save as `test-all.sh`:

```bash
#!/bin/bash

echo "🚀 BrightNest Comprehensive Test Suite"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper function
test_endpoint() {
  local name=$1
  local url=$2
  local expected_status=$3
  
  echo -n "Testing $name... "
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $status)"
    ((FAILED++))
  fi
}

echo ""
echo "1️⃣  Running Unit Tests..."
npm test --silent || ((FAILED++))

echo ""
echo "2️⃣  Testing API Endpoints..."
test_endpoint "Quiz Start" "http://localhost:3000/api/quiz/start" "200"
test_endpoint "Admin Stats (no auth)" "http://localhost:3000/api/admin/basic-stats" "401"

echo ""
echo "3️⃣  Testing Database Connection..."
npx prisma db execute --stdin <<< "SELECT 1 as test;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database connection OK${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Database connection FAILED${NC}"
  ((FAILED++))
fi

echo ""
echo "======================================"
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed!${NC}"
  exit 1
fi
```

**Run all tests:**
```bash
chmod +x test-all.sh
./test-all.sh
```

---

## Performance Benchmarks

**Target Performance (1000 completions/month):**

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| Quiz Start | <100ms | TBD | ⏳ |
| Quiz Answer | <50ms | TBD | ⏳ |
| Quiz Result | <200ms | TBD | ⏳ |
| Admin Stats | <500ms | TBD | ⏳ |
| Affiliate Stats | <300ms | TBD | ⏳ |
| Closer Stats | <100ms | TBD | ⏳ |
| Database Queries | <50ms (p95) | TBD | ⏳ |
| Completion Rate | >50% | TBD | ⏳ |

**How to Measure:**
```bash
# Run performance test
./test-all.sh > results.txt

# Check response times
cat results.txt | grep "Time:"

# Monitor database
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## Contact

For issues or questions:
1. Check failing tests: `npm test`
2. Review logs: `vercel logs`
3. Check database: `npx prisma studio`
4. Monitor performance: Vercel Analytics dashboard

**Last Updated:** November 23, 2025

