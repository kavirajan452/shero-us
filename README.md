# Shero — Food & Lifestyle Platform

A full-stack web + mobile application built with **Next.js 15** (App Router), React 18, Supabase, Tailwind CSS, and shadcn/ui. The mobile app targets Android via **Capacitor**.

---

## Table of Contents

1. [Project Structure — why there are two folders](#project-structure)
2. [Quick Start (web)](#quick-start-web)
3. [Environment Variables](#environment-variables)
4. [Available Scripts](#available-scripts)
5. [Tech Stack](#tech-stack)
6. [Architecture Overview](#architecture-overview)
7. [Routing Reference](#routing-reference)
8. [Android / Capacitor Build](#android--capacitor-build)
9. [Deployment (Vercel)](#deployment-vercel)
10. [Testing](#testing)
11. [Migration Notes (Vite → Next.js)](#migration-notes-vite--nextjs)

---

## Project Structure

```
shero-us/
├── app/                   ← Next.js 15 App Router (entry point)
│   ├── layout.tsx         ← Root HTML shell + global providers
│   ├── globals.css        ← Imports src/index.css & src/App.css
│   ├── page.tsx           ← "/" route → src/pages/Index.tsx
│   ├── admin/             ← /admin/** routes (nested layout)
│   ├── partner/           ← /partner/** routes (nested layout)
│   └── ...                ← All other customer/legal routes
│
├── src/                   ← All React components, pages, hooks, contexts
│   ├── pages/             ← Page components (re-exported by app/)
│   │   ├── admin/         ← ~60 admin page components
│   │   ├── partner/       ← ~20 partner page components
│   │   └── legal/         ← Privacy, Terms, Cookies, etc.
│   ├── components/        ← Shared UI components (shadcn/ui + custom)
│   ├── contexts/          ← React contexts (Auth, Cart, Wallet, Region)
│   ├── hooks/             ← Custom React hooks
│   ├── layouts/           ← AdminLayout, PartnerLayout
│   ├── lib/               ← Utilities + router-compat shim
│   ├── integrations/
│   │   └── supabase/      ← Supabase client & generated types
│   └── i18n/              ← Internationalisation (i18next)
│
├── next.config.mjs        ← Next.js configuration
├── vite.config.ts         ← Kept for reference (not used for running)
├── capacitor.config.ts    ← Mobile (Android) configuration
├── tailwind.config.ts
└── tsconfig.json
```

### Why does `src/` still look like a Vite project?

The project was originally built with **Vite + React Router**. It has been migrated to **Next.js 15 App Router** while keeping all existing page and component files untouched inside `src/`.

The `app/` directory contains thin wrapper files — each one simply re-exports the matching component from `src/pages/`. This means:

- All business logic, hooks, and components live in `src/` as before.
- `app/` provides the Next.js routing layer on top.
- `vite.config.ts` and `index.html` are kept for reference but **are not used** when running the app. The active build tool is Next.js.
- All `react-router-dom` imports (`useNavigate`, `useParams`, `Link`, etc.) across the codebase are transparently redirected to a compatibility shim (`src/lib/router-compat.tsx`) via a webpack alias in `next.config.mjs` — so none of the existing page files needed to be modified.

---

## Quick Start (web)

**Requirements:** Node.js ≥ 18, npm ≥ 9

```bash
# 1. Clone the repo
git clone https://github.com/kavirajan452/shero-us.git
cd shero-us

# 2. Install dependencies
npm install

# 3. Create your environment file (see next section)
cp .env.local.example .env.local
# → fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# 4. Start the development server
npm run dev
# → opens at http://localhost:3000
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

> **Note:** The old Vite variable names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are no longer used. Update your hosting platform (Vercel, Netlify, etc.) to use the `NEXT_PUBLIC_` prefix.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server (hot reload) at `http://localhost:3000` |
| `npm run build` | Production build (outputs to `.next/`) |
| `npm start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm test` | Run Vitest unit tests (single run) |
| `npm run test:watch` | Run Vitest in watch mode |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5.15 (App Router) |
| UI library | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Backend / DB | Supabase (Postgres + Auth + Realtime) |
| Data fetching | TanStack Query (React Query) v5 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Charts | Recharts |
| Maps | Leaflet + React Leaflet |
| i18n | i18next + react-i18next |
| Mobile | Capacitor 8 (Android) |
| Tests | Vitest + Testing Library |

---

## Architecture Overview

```
Browser request
      │
      ▼
app/layout.tsx          ← HTML shell, loads <Providers> (QueryClient, Auth,
      │                     Cart, Wallet, Region, Tooltip, Toasters)
      ▼
app/**/page.tsx         ← Thin re-export: `export { default } from '@/pages/...'`
      │
      ▼
src/pages/**/*.tsx      ← Actual page components (all client components)
      │
      ├── src/components/   ← Shared UI
      ├── src/contexts/     ← React context providers
      ├── src/hooks/        ← Custom hooks (Supabase queries, etc.)
      └── src/integrations/supabase/  ← Typed Supabase client
```

### react-router-dom compatibility shim

Because the original codebase used React Router throughout, a webpack alias in `next.config.mjs` maps all `import ... from 'react-router-dom'` statements to `src/lib/router-compat.tsx`. That file re-exports Next.js-native equivalents:

| react-router-dom | Next.js equivalent (via shim) |
|---|---|
| `useNavigate()` | `useRouter()` |
| `useParams()` | `useParams()` from `next/navigation` |
| `useLocation()` | `usePathname()` + `useSearchParams()` |
| `useSearchParams()` | `useSearchParams()` from `next/navigation` |
| `<Link to="...">` | `<NextLink href="...">` |
| `<Navigate to="...">` | `useEffect(() => router.push(...))` |
| `<Outlet>` | `{children}` prop (layouts updated) |

---

## Routing Reference

### Customer routes

| URL | Page component |
|---|---|
| `/` | `src/pages/Index.tsx` |
| `/subscriptions` | `src/pages/Subscriptions.tsx` |
| `/party-orders` | `src/pages/PartyOrders.tsx` |
| `/sweets-snacks` | `src/pages/SweetsSnacks.tsx` |
| `/sweets-snacks/:id` | `src/pages/SnackDetail.tsx` |
| `/instant-delivery` | `src/pages/InstantDelivery.tsx` |
| `/instant-delivery/kitchen/:id` | `src/pages/KitchenDetail.tsx` |
| `/instant-delivery/item/:id` | `src/pages/ItemDetail.tsx` |
| `/checkout` | `src/pages/Checkout.tsx` |
| `/auth` | `src/pages/Auth.tsx` |
| `/customer` | `src/pages/Profile.tsx` |
| `/referrals` | `src/pages/CustomerReferrals.tsx` |

### Partner routes (authenticated, nested layout)

| URL | Page component |
|---|---|
| `/partner` | `src/pages/partner/PartnerDashboard.tsx` |
| `/partner/orders` | `src/pages/partner/PartnerOrders.tsx` |
| `/partner/menu` | `src/pages/partner/PartnerMenuManagement.tsx` |
| `/partner/earnings` | `src/pages/partner/PartnerEarnings.tsx` |
| ... | (20+ partner routes) |

### Admin routes (authenticated, nested layout)

| URL | Page component |
|---|---|
| `/admin/login` | `src/pages/AdminLogin.tsx` |
| `/admin` | `src/pages/admin/AdminDashboard.tsx` |
| `/admin/orders` | `src/pages/admin/AdminOrders.tsx` |
| `/admin/partners` | `src/pages/admin/AdminPartners.tsx` |
| `/admin/finance-dashboard` | `src/pages/admin/AdminFinanceDashboard.tsx` |
| ... | (80+ admin routes) |

---

## Android / Capacitor Build

> The Capacitor build currently points to the hosted Lovable preview URL. To use your own Next.js deployment, update `capacitor.config.ts`.

```bash
# 1. Build the Next.js app (for static export) or point to your deployment URL
npm run build

# 2. Sync web assets into the Android project
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

Then build and run from Android Studio as usual.

---

## Deployment (Vercel)

This project is ready to deploy on [Vercel](https://vercel.com) with zero configuration:

1. Import the GitHub repo in Vercel.
2. Set the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Deploy — Vercel auto-detects Next.js.

For other platforms (Netlify, Railway, Render), set the same env vars and run `npm run build && npm start`.

---

## Testing

Unit tests use [Vitest](https://vitest.dev) and [@testing-library/react](https://testing-library.com):

```bash
npm test            # single run
npm run test:watch  # watch mode
```

Test files live in `src/test/`.

---

## Migration Notes (Vite → Next.js)

The project was migrated from **Vite 5 + React Router 6** to **Next.js 15 App Router** in April 2026. Key changes:

| What changed | Detail |
|---|---|
| Build tool | Vite → Next.js (`npm run dev` now runs `next dev`) |
| Routing | `BrowserRouter` / `<Route>` definitions in `App.tsx` → file-system routes under `app/` |
| Environment variables | `VITE_*` → `NEXT_PUBLIC_*` |
| Layouts | `<Outlet />` from React Router → `{children}` prop in Next.js layouts |
| react-router-dom | All imports aliased to `src/lib/router-compat.tsx` — no changes needed in existing files |
| Context providers | Extracted from `App.tsx` into `src/components/Providers.tsx` |
| next version | **15.5.15** — patches RSC deserialization DoS CVEs present in 14.x |

The original `vite.config.ts`, `index.html`, and `src/App.tsx` are kept in the repository for reference but are **not used** by the running application.
