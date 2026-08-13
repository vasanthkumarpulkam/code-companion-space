# Housecal Pro

**A home-services marketplace connecting Texas homeowners with verified providers — built on Supabase with row-level security on every table.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

Housecal Pro is a three-sided marketplace — customers, service providers, and administrators — for cleaning, moving, landscaping, handyman and event work.

Customers post a job. Providers bid. Both sides negotiate over realtime chat, and an admin console handles moderation, disputes and payouts.

The security model is the part worth looking at: **all 20 database tables have row-level security enabled, governed by 102 explicit policies.** Data access rules live in Postgres, not in application code.

## Screenshots

<!-- Add screenshots here:
![Landing page](docs/screenshots/landing.png)
![Job feed](docs/screenshots/jobs.png)
![Admin dashboard](docs/screenshots/admin.png)
-->

## Features

**For customers**

- Post jobs with photos, budget, timeline and location
- Guided service-request wizard
- Compare bids side by side with provider ratings and badges
- Realtime chat with typing indicators, read receipts and message reactions
- Job completion flow with mutual reviews
- Quick-quote requests direct to providers

**For providers**

- Filtered job feed with map view and advanced search
- Bid submission and tracking
- Verification badges and portfolio profiles
- Realtime notifications on new jobs and bid status changes
- Provider dashboard with quote pipeline

**For administrators**

- User management and role assignment
- Job oversight and content moderation
- Dispute resolution workflow
- Financial reports
- Category and badge management
- Full audit log
- Platform settings

**Platform**

- English/Spanish language switching
- Location-aware search with geocoding edge function
- Error boundaries, lazy image loading and performance instrumentation

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router |
| Data | TanStack Query, Supabase JS client |
| Backend | Supabase — Postgres, Auth, Realtime, Storage, Edge Functions |
| Tooling | ESLint, Supabase CLI |

## Architecture

```
Browser (React Router)
   │
   ├── AuthContext ──────── Supabase Auth (email + Google OAuth)
   ├── LanguageContext ──── EN / ES
   │
   └── Supabase client
         ├── Queries & mutations ──► Postgres  ── 20 tables, RLS on all
         ├── Realtime channels   ──► jobs, bids, messages, quotes, presence
         ├── Storage             ──► job photos, avatars
         └── Edge Functions      ──► geocode
```

### Security model

Access control is enforced in the database, not the client:

| Resource | Policy |
|---|---|
| Profiles | Publicly readable; writable only by the owner |
| Jobs | Publicly readable; created by customers; updated/deleted only by the owner |
| Bids | Visible to the bidding provider and the job owner only |
| Messages | Visible to sender and recipient only |
| User roles | Readable by the user; managed only by admins via a `SECURITY DEFINER` function |
| Categories | Public read-only |

See [SECURITY.md](SECURITY.md) for the full policy.

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier is sufficient)
- Supabase CLI (for running migrations)

### Install

```bash
git clone https://github.com/vasanthkumarpulkam/code-companion-space.git
cd code-companion-space
npm install
```

### Configure

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase publishable (anon) key |

> `.env.local` is gitignored. Never commit a `SUPABASE_SERVICE_ROLE_KEY` — it bypasses every RLS policy in this project.

### Set up the database

```bash
supabase link --project-ref <your-project-ref>
supabase db push          # applies all 30 migrations
supabase functions deploy geocode
```

Then in the Supabase dashboard enable Realtime on the `jobs`, `bids`, `messages` and `quotes` tables.

### Run

```bash
npm run dev              # http://localhost:5173
npm run build
npm run lint
```

## Project structure

```
code-companion-space/
├── src/
│   ├── pages/           Landing, auth, dashboards, jobs, chats, admin, settings
│   ├── components/
│   │   ├── admin/       User management, disputes, reports, audit log
│   │   ├── jobs/        Job cards, bids, filters, map view
│   │   ├── chat/        Reactions, typing indicators, presence
│   │   ├── providers/   Provider cards, badges, quick quotes
│   │   └── ui/          shadcn/ui primitives
│   ├── contexts/        Auth and language providers
│   ├── hooks/           Realtime subscriptions, search, uploads, notifications
│   ├── integrations/    Supabase client and generated types
│   └── utils/           Analytics and performance instrumentation
└── supabase/
    ├── migrations/      30 migrations — schema, RLS policies, triggers
    └── functions/       Edge functions (geocode)
```

## Documentation

- [SECURITY.md](SECURITY.md) — security model and vulnerability reporting
- [DEPLOYMENT.md](DEPLOYMENT.md) — deployment guide
- [ACCESSIBILITY.md](ACCESSIBILITY.md) — accessibility commitments
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guide

## Roadmap

| Phase | Focus | Status |
|---|---|---|
| 1 | Schema, RLS, tooling | ✅ Complete |
| 2 | Auth, profiles, jobs, bids, chat, notifications | ✅ Complete |
| 3 | Admin workflows, reviews, accessibility | ✅ Complete |
| 4 | Stripe payments and payouts, Google Maps, Translate | 🔄 In progress |
| 5 | CI/CD, automated testing, observability | 📋 Planned |

## License

MIT — see [LICENSE](LICENSE).

## Author

**Vasanth Kumar Pulkam** — [GitHub](https://github.com/vasanthkumarpulkam)
