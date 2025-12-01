# Database Migration Guide

## 🎯 What We Did

We've transitioned from `prisma db push` to proper **Prisma Migrations** for professional database management.

### Before:
- ❌ Used `prisma db push` - no migration history
- ❌ Incomplete/inconsistent migration files
- ❌ Would fail if someone tried to recreate database

### After:
- ✅ Professional migration system with full history
- ✅ Complete baseline migration (611 lines, 23 tables, 9 enums)
- ✅ Version-controlled database changes
- ✅ Safe deployments to staging/production

---

## 📁 What's New

### Migration Files
```
prisma/migrations/
├── 0_init/
│   └── migration.sql    # 611-line baseline with ALL your tables
└── migration_lock.toml  # Ensures consistent database provider
```

### Backup
Your old migrations are safely backed up in:
```
.backup/migrations-backup-20251108-222941/
```

---

## 🚀 Next Steps (IMPORTANT!)

### Step 0: Fix Supabase Connection Issue (REQUIRED!)
⚠️ **READ FIRST:** See `SUPABASE-MIGRATION-FIX.md` for detailed instructions.

**Quick version:**
1. Add `DIRECT_URL` to your `.env` file (change port from 6543 to 5432, remove `?pgbouncer=true`)
2. Your `schema.prisma` already updated to use it ✅

**Why?** Prisma Migrate doesn't work with Supabase's connection pooler. You need a direct connection for migrations.

### Step 1: Mark Baseline Migration as Applied
After fixing the connection issue above, tell Prisma your database already has all tables:

```bash
npm run db:migrate:status  # Check current status
npx prisma migrate resolve --applied 0_init  # Mark baseline as applied
```

### Step 2: Verify It Worked
```bash
npm run db:migrate:status
```

You should see:
```
Database schema is up to date!
```

---

## 📖 How to Use Going Forward

### Creating New Migrations

**Option 1: Let Prisma generate the migration (RECOMMENDED)**
```bash
# 1. Edit prisma/schema.prisma
# 2. Run migration command (it will auto-generate SQL)
npm run db:migrate
```

**Option 2: Development with push (faster iteration)**
```bash
# For quick local changes during development
npm run db:push
```

### Deploying to Production
```bash
# Deploy migrations to production (doesn't create new ones)
npm run db:migrate:deploy
```

### Checking Migration Status
```bash
npm run db:migrate:status
```

---

## 🎓 Commands Explained

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run db:migrate` | Create + apply migration | New schema changes |
| `npm run db:migrate:deploy` | Apply migrations only | Production deployment |
| `npm run db:migrate:status` | Check migration state | Debugging, verification |
| `npm run db:push` | Push schema directly (no migration) | Fast dev iteration |
| `npm run db:generate` | Regenerate Prisma Client | After schema changes |

---

## 💡 Best Practices

### During Development
- ✅ Use `db:push` for rapid iteration when you're still figuring things out
- ✅ Once feature is stable, create a proper migration with `db:migrate`
- ✅ Commit migration files to git

### Before Deploying
- ✅ Always run `db:migrate:status` to check state
- ✅ Review generated SQL before applying
- ✅ Test migrations on staging first
- ✅ Use `db:migrate:deploy` in CI/CD pipelines

### DO NOT
- ❌ Manually edit migration files after they're applied
- ❌ Delete migration files (they're your database history)
- ❌ Use `db:push` in production

---

## 🔧 Troubleshooting

### "Migration already applied" error
```bash
npx prisma migrate resolve --applied <migration_name>
```

### "Migration failed to apply" error
```bash
npx prisma migrate resolve --rolled-back <migration_name>
# Then fix the issue and re-run
```

### Connection timeout with Supabase
- Wait a few minutes and try again
- Check Supabase dashboard for connection pool issues
- Consider using direct connection string (not pooler) for migrations

### Schema drift detected
```bash
# Your database doesn't match schema.prisma
# Either create a migration or push directly
npm run db:migrate
```

---

## 📊 What's in the Baseline Migration?

The `0_init` migration includes:

### Enums (9)
- AffiliateTier, PayoutMethod, ConversionStatus, CommissionStatus
- PayoutStatus, AppointmentStatus, CallOutcome
- TaskPriority, TaskStatus

### Tables (23)
1. users
2. quiz_sessions
3. quiz_questions
4. quiz_answers
5. results
6. articles (with ALL customization fields)
7. article_triggers
8. article_templates
9. article_views
10. loading_screens (with ALL display fields)
11. affiliates
12. affiliate_clicks
13. normal_website_clicks
14. affiliate_conversions
15. affiliate_payouts
16. affiliate_audit_logs
17. closers
18. appointments
19. tasks
20. notes
21. closer_audit_logs
22. closer_scripts
23. closer_script_assignments

All indexes, foreign keys, and constraints included! ✨

---

## 🎉 Benefits You Now Have

1. **Version Control** - Every database change tracked in git
2. **Team Ready** - New developers can recreate your exact database
3. **Safe Deployments** - Migrations tested before production
4. **Rollback Ability** - Can undo changes if needed
5. **CI/CD Ready** - Automated deployments work properly
6. **Audit Trail** - See when and why every change was made

---

## ❓ Questions?

- **"Can I still use db:push?"** - Yes! Use it for dev, but create proper migrations for production.
- **"Do I commit migrations?"** - Yes! They're part of your codebase.
- **"What if a migration fails?"** - Use `migrate resolve` to mark state, fix issue, retry.

---

**Pro Tip:** Run `npm run db:migrate:status` regularly to ensure your database is in sync! 🚀

