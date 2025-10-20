# BrightNest MVP

A Noom-style quiz funnel for finance that helps users discover their financial personality and get personalized insights.

## Features

- **Quiz Flow**: Step-by-step quiz with progress tracking
- **Financial Archetypes**: 4 personality types (Debt Crusher, Savings Builder, Stability Seeker, Optimizer)
- **Personalized Results**: Custom insights based on quiz responses
- **Admin Dashboard**: Analytics and session management
- **Email Authentication**: Passwordless login for admin access

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: Prisma + PostgreSQL
- **Authentication**: NextAuth.js with Email provider
- **Deployment**: Vercel + Supabase

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Supabase)
- Email service (Gmail SMTP recommended)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd birghtnest
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/brightnest"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Email provider (for admin auth)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="your-email@gmail.com"
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed the database with quiz questions
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Main app: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin

## Database Schema

### Tables

- **users**: Admin users with email authentication
- **quiz_sessions**: Quiz session tracking
- **quiz_questions**: Quiz questions and options
- **quiz_answers**: User answers with dwell time
- **results**: Calculated archetypes and scores

## Quiz Flow

1. User visits `/quiz` → starts quiz session
2. Questions displayed one by one with progress bar
3. Answers stored with dwell time tracking
4. Final question → archetype calculation
5. Results page shows personalized insights

## Admin Features

- Total sessions and completion rates
- Average quiz duration
- Archetype distribution
- Recent sessions table
- CSV export functionality

## Deployment

### Vercel + Supabase

1. **Set up Supabase**
   - Create new project
   - Get connection string
   - Update `DATABASE_URL` in Vercel environment variables

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure environment variables in Vercel dashboard**
   - Add all variables from `.env` file
   - Update `NEXTAUTH_URL` to your Vercel domain

## Development

### Adding New Questions

Edit `prisma/seed.ts` to add new questions:

```typescript
{
  order: 6,
  prompt: "Your question here?",
  type: "single",
  options: [
    {
      label: "Option 1",
      value: "option1",
      weightCategory: "debt", // or "savings", "spending", "investing"
      weightValue: 2
    },
    // ... more options
  ]
}
```

Then run:
```bash
npm run db:seed
```

### Customizing Archetypes

Edit `lib/scoring.ts` to modify:
- Archetype calculation logic
- Personalized insights for each archetype

## API Endpoints

- `POST /api/quiz/start` - Start new quiz session
- `POST /api/quiz/answer` - Submit answer and get next question
- `POST /api/quiz/result` - Calculate final archetype
- `GET /api/admin/stats` - Admin dashboard statistics
- `GET /api/results/[id]` - Get quiz result by ID

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details# Deployment fix
# Mon Oct 20 10:39:12 EEST 2025
# Deployment retry - Mon Oct 20 10:42:37 EEST 2025
