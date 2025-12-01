# BrightNest Monorepo

Microservices architecture for BrightNest financial quiz platform.

## Structure

```
birghtnest/
├── apps/
│   ├── marketing/     # Public marketing site (joinbrightnest.com)
│   └── app/          # Admin/CRM platform (app.joinbrightnest.com)
├── package.json      # Root package.json
└── README.md         # This file
```

## Projects

### Marketing Site (`apps/marketing`)
- **URL**: https://joinbrightnest.com
- **Purpose**: Public-facing quiz, landing pages, blog
- **Port**: 3000 (dev)

### App Platform (`apps/app`)
- **URL**: https://app.joinbrightnest.com
- **Purpose**: Admin dashboard, CRM, affiliate/closer portals
- **Port**: 3001 (dev)

## Quick Start

### Install all dependencies

```bash
# Install marketing dependencies
cd apps/marketing
npm install

# Install app dependencies
cd ../app
npm install
```

### Run both projects

```bash
# Terminal 1: Marketing site
cd apps/marketing
npm run dev

# Terminal 2: App platform
cd apps/app
npm run dev
```

### Access locally

- Marketing: http://localhost:3000
- App: http://localhost:3001

## Deployment

Both projects are deployed to Vercel from the same GitHub repository:

### Marketing (brightnest)
- **Root Directory**: `apps/marketing`
- **Build Command**: `npm run build`
- **Domain**: joinbrightnest.com

### App (brightnest-app)
- **Root Directory**: `apps/app`
- **Build Command**: `npm run build`
- **Domain**: app.joinbrightnest.com

## Database

Both projects share the same PostgreSQL database:
- **Provider**: Supabase/Vercel Postgres
- **Schema**: Managed via Prisma in each project
- **Migrations**: Run from `apps/app` (primary)

## Architecture Benefits

✅ **Independent Deployments** - Each project deploys separately  
✅ **Fault Isolation** - If one fails, the other continues  
✅ **Scalability** - Scale each service independently  
✅ **Security** - Admin separated from public site  
✅ **Development Speed** - Teams can work independently  

## Environment Variables

Each project has its own `.env.local` file. See:
- `apps/marketing/.env.local.example`
- `apps/app/.env.local.example`

## Documentation

- [Marketing README](apps/marketing/README.md)
- [App README](apps/app/README.md)
- [Implementation Plan](implementation_plan.md)
