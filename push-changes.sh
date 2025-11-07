#!/bin/bash
cd /Users/stefantudosescu/birghtnest
git add -A
git commit -m "Cleanup: Remove unused files and fix PrismaClient instances

- Deleted 38 unused files (debug API routes, SQL scripts, test files, docs)
- Fixed 6 duplicate PrismaClient instances to use shared singleton
- Removed empty directories
- All functionality verified and working
- Build successful with no errors"
git push

