#!/bin/bash

# Apply Supabase Migration Script
# Make sure DATABASE_URL is in your .env file

echo "🔄 Applying database migration..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env with your DATABASE_URL"
    exit 1
fi

# Load DATABASE_URL from .env
export $(grep -v '^#' .env | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env"
    exit 1
fi

echo "📊 Connecting to database..."
echo "Running migration from supabase_migration.sql..."
echo ""

# Apply migration using psql
psql "$DATABASE_URL" -f supabase_migration.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📈 Performance indexes added:"
    echo "   - normal_website_clicks table created"
    echo "   - 18 indexes added for faster queries"
    echo ""
    echo "🚀 Your database is now optimized!"
else
    echo ""
    echo "❌ Migration failed"
    echo "Try running manually in Supabase SQL Editor instead"
fi

