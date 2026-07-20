# RailTimer

An SEO-optimized, ad-monetized information site for Indian Railways passengers —
train schedules, routes, PNR status, chart-preparation countdowns, and live running
status. Built for programmatic scale (thousands of train/route pages) with real-time data and high-performance caching.

> **Status:** Live & Production Ready. Live Supabase PostgreSQL database connected,
> live RailRadar API integrated (`https://api.railradar.in/v1`), automated daily data collection active via Vercel Cron, Google AdSense (`ads.txt`) configured, and Vercel Analytics enabled.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, TypeScript strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) via Prisma 6 (Shared Pooler in `ap-south-1`) |
| Data Provider | RailRadar Live API (`api.railradar.in/v1`) |
| Caching | Upstash Redis (serverless), cache-first reads for live train data |
| Validation | Zod — every external API response is parsed before entering app code |
| Analytics & Ads | Vercel Analytics + Google AdSense (`public/ads.txt` verified) |
| Deployment | Vercel with Automated Daily Cron Sync |

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values for Supabase and RailRadar
npx prisma generate
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Live deployment is active at [https://railtimer.vercel.app](https://railtimer.vercel.app).

## Project structure

```text
railtimer/
├── app/                        # Next.js 15 App Router pages & API routes
│   ├── api/
│   │   └── cron/
│   │       └── sync-trains/    # Vercel daily automated data sync cron route
│   ├── blog/                   # SEO blog post pages
│   ├── station/[code]/         # Dynamic station route pages
│   ├── train/[slug]/           # Dynamic train schedule & tracking pages
│   ├── layout.tsx              # Root layout (Header, Footer, Analytics)
│   └── page.tsx                # Homepage & train search interface
│
├── components/                 # UI components & primitives
│   ├── ads/
│   │   └── AdSlot.tsx          # Google AdSense unit with reserved CLS height
│   ├── layout/                 # Site Header, Footer, and MobileNav
│   └── ui/                     # shadcn/ui primitives
│
├── data/                       # Structured static data & datasets
│   └── railradar/
│       ├── trains_data.json    # Complete train schedule dataset
│       └── trains_index.json   # Full Indian Railways train registry
│
├── lib/                        # Core application services & clients
│   ├── prisma.ts               # Prisma Client singleton
│   ├── redis.ts                # Upstash Redis caching layer
│   ├── rail-data-provider.ts   # Live RailRadar API client & mock fallbacks
│   └── schemas/                # Zod validation schemas
│
├── prisma/                     # Database migrations & seed scripts
│   ├── migrations/             # Version-controlled migration history
│   ├── schema.prisma           # Database schema (Train, Stop, BlogPost)
│   └── seed.ts                 # Database seed script for Supabase
│
├── public/                     # Static assets & verification files
│   ├── ads.txt                 # Google AdSense publisher verification file
│   └── favicon.ico
│
├── scripts/                    # Automation & test CLI scripts
│   └── test-sync.ts            # Live API fetch & DB upsert test runner
│
├── .env                        # Local environment variables
├── package.json                # Project dependencies & scripts
└── vercel.json                 # Vercel deployment & cron schedule config
```

## Architecture notes

- **`RailDataProvider` is the single door to external rail data.** All components, pages, and API routes call `getRailDataProvider()`, which connects to `https://api.railradar.in/v1` when `RAIL_DATA_API_KEY` is present, wrapped with Upstash Redis caching and Zod validation.
- **Supabase Database & Prisma Migrations.** `DATABASE_URL` uses the shared pooler (`aws-1-ap-south-1.pooler.supabase.com:6543`) for runtime connections, and `DIRECT_URL` handles migrations.
- **Automated Data Collection.** Vercel Cron (`vercel.json`) automatically triggers `/api/cron/sync-trains` at midnight (`0 0 * * *`) to fetch live running statuses and sync priority train data into Supabase.
- **Google AdSense & CLS Protection.** `AdSlot` pre-reserves unit heights before scripts load to prevent Cumulative Layout Shift (CLS), backed by `public/ads.txt` for publisher verification.

## Environment variables

See [`.env.example`](.env.example) for the full list:
- `DATABASE_URL` & `DIRECT_URL` (Supabase PostgreSQL pooler)
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RAIL_DATA_API_KEY` & `RAIL_DATA_API_BASE_URL` (RailRadar API)
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` (Google AdSense)

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npm run db:seed  # seed Supabase database with RailRadar dataset
npx tsx scripts/test-sync.ts # test live API fetch and DB persistence
```
