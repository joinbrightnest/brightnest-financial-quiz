# BrightNest Marketing Site

Public-facing marketing site for BrightNest financial quiz platform.

## Features

- **Quiz Flow**: Interactive financial personality quiz
- **Landing Pages**: Affiliate-specific landing pages
- **Results**: Personalized quiz results
- **Blog**: Financial education content
- **Static Pages**: About, FAQ, Careers, etc.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: Prisma + PostgreSQL (shared with app)
- **Deployment**: Vercel

## Development

```bash
# Install dependencies
npm install

# Run development server (port 3000)
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
NEXT_PUBLIC_APP_URL="https://app.joinbrightnest.com"
CALENDLY_WEBHOOK_SECRET="..."
```

## Deployment

This project is deployed to Vercel:
- **Domain**: joinbrightnest.com
- **Project**: brightnest
- **Root Directory**: apps/marketing

## API Routes

- `/api/quiz/*` - Quiz flow endpoints
- `/api/results/*` - Results endpoints
- `/api/track-booking` - Booking tracking
- `/api/calendly/webhook` - Calendly integration
