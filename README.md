# Code Companion Space

A Supabase-powered marketplace that connects homeowners in Texas with verified service professionals for cleaning, moving, landscaping, handyman, and event projects. The platform focuses on instant collaboration between customers, providers, and administrators while keeping data secure under strict access controls.

---

## ✨ Features Overview

- **Role-specific experiences** for customers, providers, and administrators
- **Job lifecycle management** covering requests, bids, approvals, and reviews
- **Realtime messaging & notifications** powered by Supabase Realtime
- **Location-aware flows** and multilingual-ready content (English/Spanish)
- **Security-first design** with Supabase Auth and Row Level Security on every table
- **Scalable UI system** using React 18, Vite, Tailwind CSS, and shadcn/ui

---

## 🏗 Architecture Snapshot

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| State & Data | Supabase Auth, Postgres, Realtime channels, Storage |
| Integrations | Stripe (payments & payouts, planned), Google Maps & Translate (planned) |
| Tooling | ESLint, TypeScript, Supabase CLI, Vite test tooling |

```
Browser (React Router)
      ↓
Auth + Language Contexts
      ↓
Supabase Client (queries, mutations, realtime)
      ↓
Postgres + RLS policies + Edge Functions
```

---

## 📂 Project Layout

- `src/pages/*` – landing, onboarding, dashboards, admin, jobs, chats, settings
- `src/components/*` – reusable UI blocks for jobs, providers, chat, notifications, admin widgets
- `src/contexts/*` – authentication and language providers
- `src/hooks/*` – custom Supabase hooks for data fetching and realtime updates
- `supabase/migrations` – database schema, policies, triggers, and constraints
- `supabase/functions` – placeholder for Edge Functions (payments, notifications, translations)

---

## 🚀 Development Flow

```bash
npm install
cp .env.example .env.local   # fill in project-specific secrets (not stored in git)
npm run dev
```

Local development relies on the Supabase CLI for database linting, migrations, and realtime testing.

---

## 🗺 Roadmap

| Phase | Focus |
| --- | --- |
| Phase 1 | Supabase schema audit, RLS validation, tooling setup, UX research |
| Phase 2 | Live wiring of auth, profiles, jobs, bids, chat, notifications |
| Phase 3 | Admin workflows, provider enhancements, reviews, accessibility polish |
| Phase 4 | Stripe payments/payouts, Google Maps, Translate automations |
| Phase 5 | CI/CD, automated testing, observability, launch readiness |

---

## 📄 Status

This repository is private and under active development/testing. All rights reserved.
