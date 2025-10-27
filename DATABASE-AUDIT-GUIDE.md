# Complete Database Audit Guide

## 📋 Overview
This guide will help you perform a comprehensive audit of your BrightNest database to ensure data integrity, identify issues, and optimize performance.

## 🔍 Audit Steps

### Step 1: Check for Schema Drift
**Purpose:** Verify that your Prisma schema matches the actual database structure.

**Run in Supabase:**
```sql
-- See file: check-schema-drift.sql
```

**Then run locally:**
```bash
cd /Users/stefantudosescu/birghtnest
npx prisma db pull --print
```
This will show if there are any differences between your schema and database.

---

### Step 2: Run Full Database Audit
**Purpose:** Check for duplicates, orphaned records, data integrity issues, and performance problems.

**Run in Supabase:**
```sql
-- See file: database-audit-full.sql
```

**This checks for:**
- ✅ Duplicate tables/records
- ✅ Orphaned records (data without proper references)
- ✅ Data integrity issues (mismatched totals, negative values)
- ✅ Unused/inactive data
- ✅ Missing indexes
- ✅ Database size and performance metrics

---

### Step 3: Validate Prisma Schema
**Purpose:** Ensure your Prisma schema is valid and properly formatted.

**Run locally:**
```bash
cd /Users/stefantudosescu/birghtnest

# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Check migration status
npx prisma migrate status
```

---

### Step 4: Fix Commission Counting Bug
**Purpose:** Ensure commissions aren't counted twice.

**Status:** ✅ Already fixed in code, waiting for deployment.

**To deploy:**
```bash
cd /Users/stefantudosescu/birghtnest
git add -A
git commit -m "Fix duplicate commission counting - remove increment on release"
git push origin main
```

---

## 🚨 Common Issues to Look For

### 1. Orphaned Records
**What:** Records that reference non-existent parent records.

**Examples:**
- Quiz sessions without results
- Conversions without affiliates
- Tasks without appointments

**Fix:** Delete orphaned records or update references.

---

### 2. Duplicate Records
**What:** Multiple records that should be unique.

**Examples:**
- Duplicate affiliate referral codes
- Duplicate emails
- Multiple appointments for same customer

**Fix:** Merge or delete duplicates, add unique constraints.

---

### 3. Data Integrity Issues
**What:** Stored values don't match calculated values.

**Examples:**
- Affiliate `totalCommission` doesn't match sum of conversions
- Negative amounts
- Commission > sale value

**Fix:** Recalculate and update stored values.

---

### 4. Performance Issues
**What:** Slow queries due to missing indexes or large tables.

**Examples:**
- Tables without indexes
- Unused indexes
- Large tables without partitioning

**Fix:** Add necessary indexes, remove unused ones.

---

## 📊 Expected Audit Results

### Healthy Database Indicators:
- ✅ No duplicate tables or schemas
- ✅ No orphaned records (or <1% of total)
- ✅ All commission totals match calculated values
- ✅ No negative amounts or invalid values
- ✅ All critical fields have indexes
- ✅ No overdue held commissions
- ✅ Database size is reasonable (<1GB for current scale)

### Red Flags:
- ❌ More than 5% orphaned records
- ❌ Commission mismatches >$1
- ❌ Missing indexes on foreign keys
- ❌ Duplicate unique identifiers
- ❌ Large number of unused indexes

---

## 🔧 Recommended Fixes

### Priority 1 (Critical):
1. **Fix duplicate commission counting** ✅ Done, needs deployment
2. **Remove duplicate records** (if any found)
3. **Fix data integrity issues** (commission mismatches)
4. **Add missing indexes on foreign keys**

### Priority 2 (Important):
1. **Clean up orphaned records**
2. **Add unique constraints** where needed
3. **Review cascade deletes** for safety
4. **Archive old abandoned data**

### Priority 3 (Optimization):
1. **Remove unused indexes**
2. **Consider database views** for computed stats
3. **Add soft deletes** for critical data
4. **Implement data archiving** strategy

---

## 📝 Audit Checklist

Run through this checklist and check off each item:

- [ ] Run `check-schema-drift.sql` - Any differences found?
- [ ] Run `database-audit-full.sql` - Review all sections
- [ ] Run `npx prisma validate` - Schema valid?
- [ ] Run `npx prisma migrate status` - Migrations in sync?
- [ ] Check for duplicate records - Found any?
- [ ] Check for orphaned records - Found any?
- [ ] Check commission integrity - All match?
- [ ] Check for missing indexes - Add if needed
- [ ] Check database size - Reasonable?
- [ ] Deploy commission fix - Deployed?
- [ ] Verify fix on production - Working correctly?

---

## 🎯 Next Steps After Audit

1. **Document findings** - Note any issues found
2. **Create fix scripts** - SQL to correct issues
3. **Test fixes in staging** - If available
4. **Apply fixes to production** - Carefully!
5. **Monitor** - Watch for any new issues
6. **Schedule regular audits** - Monthly recommended

---

## 📞 Questions to Answer

After running the audit, answer these:

1. **How many total records** in each main table?
2. **Any data integrity issues** found?
3. **Percentage of orphaned records?**
4. **Database size and growth rate?**
5. **Any performance bottlenecks?**
6. **Are all foreign keys indexed?**
7. **Any security concerns?** (exposed data, missing constraints)

---

## 🔄 Maintenance Schedule

### Daily:
- Monitor for new commission releases
- Check for failed transactions

### Weekly:
- Review new orphaned records
- Check for duplicate entries

### Monthly:
- Full database audit
- Performance review
- Archive old data

### Quarterly:
- Comprehensive security review
- Schema optimization review
- Backup verification

---

## 📚 Useful Commands

```bash
# Connect to database (if needed)
psql $DATABASE_URL

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (CAREFUL!)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

---

## 🆘 Troubleshooting

### If audit fails:
1. Check database connection
2. Verify Supabase credentials
3. Check for locked tables
4. Review error messages

### If mismatches found:
1. Don't panic!
2. Document the issue
3. Test fix on copy first
4. Apply fix carefully
5. Verify results

---

## ✅ Audit Complete

Once you've completed all steps:
1. Save audit results
2. Document any issues found
3. Create tickets for fixes
4. Schedule next audit
5. Update this document with learnings

---

**Last Updated:** January 27, 2025  
**Next Audit Due:** February 27, 2025

