# BrightNest App Platform

Admin dashboard, CRM, and management platform for BrightNest.

## Features

- **Admin Dashboard**: Analytics and session management
- **CRM**: Lead management and pipeline
- **Affiliate Portal**: Affiliate tracking and payouts
- **Closer Portal**: Sales call management
- **Quiz Editor**: Question and content management

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: Prisma + PostgreSQL (shared with marketing)
- **Charts**: Chart.js + react-chartjs-2
- **Auth**: JWT-based authentication
- **Rate Limiting**: Upstash Redis
- **AI**: OpenAI for content generation
- **Deployment**: Vercel

## Development

```bash
# Install dependencies
npm install

# Run development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_MARKETING_URL="https://joinbrightnest.com"
ADMIN_JWT_SECRET="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
OPENAI_API_KEY="..."
```

## Deployment

This project is deployed to Vercel:
- **Domain**: app.joinbrightnest.com
- **Project**: brightnest-app
- **Root Directory**: apps/app

## Cron Jobs

- `/api/auto-release-commissions` - Runs every 6 hours to release held commissions

## API Routes

- `/api/admin/*` - Admin endpoints
- `/api/affiliate/*` - Affiliate endpoints
- `/api/closer/*` - Closer endpoints
- `/api/leads/*` - Lead management
- `/api/tasks/*` - Task management
- `/api/notes/*` - Notes endpoints
