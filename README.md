# RailTimer

An SEO-optimized, ad-monetized information site for Indian Railways passengers —
train schedules, routes, PNR status, chart-preparation countdowns, and running
status. Built for programmatic scale (thousands of train/route pages) without
shipping thin, auto-generated-looking pages.

> **Status:** early build. Core architecture (data layer, layout shell, ad
> component) is in place, Supabase is connected with 8 real seeded trains,
> and the chart-preparation time calculator ([`/tools/chart-time-calculator`](app/tools/chart-time-calculator/page.tsx))
> is fully built and verified. Homepage, train/route page templates, and the
> PNR status tool are still to come. Live train data still runs against a
> mock provider — no rail-data API key configured yet.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, TypeScript strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) via Prisma 6 |
| Caching | Upstash Redis (serverless), cache-first reads for live train data |
| Validation | Zod — every external API response is parsed before it enters app code |
| Hosting | Vercel, ISR for train/route pages |

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values as you get accounts; placeholders work for local dev
npx prisma generate
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Live train
data (PNR status, running status, availability) is served by a deterministic
mock provider until a real rail-data API key is configured — see
[`lib/rail-data-provider.ts`](lib/rail-data-provider.ts).

## Project structure

```
/app
  page.tsx                  homepage
  layout.tsx                 root layout (Header/Footer, fonts, metadata)
  globals.css                 design tokens (Tailwind v4 @theme)
/components
  ui/                        shadcn/ui primitives
  ads/AdSlot.tsx              reusable ad unit — reserves height to avoid CLS
  layout/Header.tsx            site header + mobile nav
  layout/Footer.tsx            footer with unofficial-site disclaimer
  layout/MobileNav.tsx         client-side mobile menu toggle
  train/                      train-specific components (in progress)
/lib
  rail-data-provider.ts       single abstraction over external rail-data APIs
  prisma.ts                   Prisma client singleton
  redis.ts                    Upstash client + cache-first `cached()` helper
  schemas/rail-data.ts         Zod schemas for PNR/running-status/availability
/prisma
  schema.prisma                Train, Stop, BlogPost models
```

## Architecture notes

- **`RailDataProvider` is the only door to external rail data.** No page or
  component should import an HTTP client directly — these APIs are
  unofficial and can change without notice. `getRailDataProvider()` returns a
  Redis-cached, Zod-validated implementation; swapping the mock for a real
  provider only touches `lib/rail-data-provider.ts`.
- **Two Postgres connection strings.** `DATABASE_URL` is the pooled
  (PgBouncer) connection used at runtime; `DIRECT_URL` is used only for
  Prisma migrations. Both are set in `prisma/schema.prisma`'s `datasource`
  block.
- **Ad placement is deliberate, not decorative.** `AdSlot` reserves a fixed
  min-height per format before the ad script loads (prevents layout shift),
  and dedupes the AdSense loader script across instances via a fixed
  `next/script` id. Pages should never stack two slots back-to-back or
  sandwich a live data widget between them — max 2-3 slots per page.
- **Content over data dumps.** Every train/route page is required to carry a
  150-250 word written section (route overview, tips) alongside the live
  widget and schedule table — thin auto-generated pages risk both AdSense
  rejection and Search penalties.

## Environment variables

See [`.env.example`](.env.example) for the full list (Supabase, Upstash,
rail-data API, GA4, Clarity, AdSense). Nothing beyond local Postgres
placeholders is required to run the app today.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```
