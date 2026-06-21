# SpendWise — Frontend

> **React 19 · TypeScript · Vite · Tailwind CSS 4 · Redux Toolkit · React Query · Recharts**

SpendWise is a personal finance management web application. The frontend delivers a rich, responsive dashboard where users can track income and expenses, manage savings goals and budgets, view detailed analytics, and chat with an AI-powered financial assistant.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [State Management](#state-management)
- [Getting Started](#getting-started)
- [Environment & Configuration](#environment--configuration)
- [Build & Deployment](#build--deployment)
- [Scripts](#scripts)

---

## Features

- **Authentication** — Login and registration forms with Google OAuth support; protected routes with automatic session checks
- **Dashboard (Home)** — At-a-glance overview of income, expenses, balance, and recent activity
- **Transactions Page** — View, filter, and manage all income and expense records
- **Analytics Page** — Rich charts (bar, line, pie) for spending patterns, income vs expense breakdowns, category-level analysis, and budget utilisation
- **Budgets Page** — Create and track expense budgets (weekly/monthly/yearly) with visual progress indicators
- **Goals Page** — Create and monitor savings goals and income goals with progress bars and deadline tracking
- **AI Chat Assistant** — Dedicated `/chat` conversational interface with auto-growing composer, markdown support, and intelligent auto-scrolling; backed by the backend's multi-agent AI system to render structured response cards.
- **Profile Page** — View and update user profile information
- **Premium Fintech UI** — Custom dark navy design system featuring split-screen auth layouts, abstract grid motifs, custom SVG geometric logo, interactive focus rings, and glassmorphic panels.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript ~6 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite` plugin) |
| Global State | Redux Toolkit 2 + `react-redux` |
| Server State | TanStack React Query 5 |
| HTTP Client | Axios |
| Charts | Recharts 3 |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Linting | ESLint 9 + TypeScript ESLint |

---

## Project Structure

```
spendfront/
├── public/                          # Static assets
├── src/
│   ├── main.tsx                     # App entry: Redux Provider, Router, React Query client
│   ├── App.tsx                      # Route definitions + auth check on mount
│   ├── App.css                      # Global styles & design system tokens
│   ├── index.css                    # Base resets
│   │
│   ├── components/
│   │   ├── AppLayout.tsx            # Sidebar + main content wrapper
│   │   ├── Sidebar.tsx              # Navigation sidebar with custom SVG logo
│   │   ├── Logo.tsx                 # Scalable geometric badge logo component
│   │   └── ProtectedRoute.tsx       # Auth guard — redirects to /login if unauthenticated
│   │
│   ├── pages/
│   │   ├── HomePage.tsx             # Dashboard overview
│   │   ├── TransactionsPage.tsx     # Income & expense history
│   │   ├── AnalyticsPage.tsx        # Charts and financial insights
│   │   ├── BudgetsPage.tsx          # Expense budget management
│   │   ├── GoalsPage.tsx            # Savings goals & income goals
│   │   ├── ChatPage.tsx             # Full-page AI financial assistant chat UI
│   │   ├── ProfilePage.tsx          # User profile management
│   │   ├── LoginPage.tsx            # Premium split-screen Login form
│   │   └── SignupPage.tsx           # Premium split-screen Registration form
│   │
│   ├── store/
│   │   ├── store.ts                 # Redux store configuration
│   │   ├── hooks.ts                 # Typed useAppDispatch / useAppSelector
│   │   ├── api.ts                   # Axios instance with base URL + credentials
│   │   └── slices/
│   │       ├── authSlice.ts         # Auth state (user, isAuthenticated, loading)
│   │       ├── transactionSlice.ts  # Income/expense local state
│   │       ├── budgetSlice.ts       # Budget local state
│   │       └── goalSlice.ts         # Goal local state
│   │
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Shared utilities / helpers
│   ├── types/                       # Shared TypeScript types
│   └── assets/                      # Images and static files
│
├── index.html                       # HTML entry with meta tags
├── vite.config.ts                   # Vite configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.app.json                # TypeScript config for app code
├── vercel.json                      # Vercel deployment config (SPA rewrites)
└── package.json
```

---

## Pages & Routes

| Path | Page | Auth Required |
|---|---|---|
| `/home` | Dashboard overview | ✅ |
| `/transactions` | Income & expense history | ✅ |
| `/analytics` | Charts and insights | ✅ |
| `/budgets` | Budget management | ✅ |
| `/goals` | Savings & income goals | ✅ |
| `/chat` | AI assistant chat | ✅ |
| `/profile` | User profile | ✅ |
| `/login` | Login form | ❌ |
| `/signup` | Registration form | ❌ |
| `/*` | → redirects to `/home` | — |

All protected routes are wrapped in `<ProtectedRoute>` which reads authentication state from Redux and redirects to `/login` if unauthenticated.

---

## State Management

### Redux Toolkit (Global UI State)

| Slice | Responsibility |
|---|---|
| `authSlice` | Current user object, `isAuthenticated`, loading state; dispatches `checkAuth()` on app load |
| `transactionSlice` | Cached income/expense records |
| `budgetSlice` | Cached budget records |
| `goalSlice` | Cached savings and income goal records |

### TanStack React Query (Server State)

Used for data fetching, caching, and invalidation of server-side data (e.g., income lists, expense summaries, analytics data). React Query handles loading/error states and background refetching.

### Axios Instance (`store/api.ts`)

Pre-configured with:
- Base URL pointing to the backend (`http://localhost:3000` in development)
- `withCredentials: true` to send session cookies automatically

---

## Getting Started

### Prerequisites
- Node.js 20+
- The SpendWise backend running on port `3000`

### 1. Install Dependencies

```bash
cd spendfront
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

App runs at **http://localhost:5173**

> Make sure the backend is running at `http://localhost:3000` before using any authenticated features.

---

## Environment & Configuration

The Axios base URL is configured in `src/store/api.ts`. To point at a different backend URL, update that file or use an environment variable pattern with `import.meta.env`.

For production, the `vercel.json` rewrites all routes to `index.html` so React Router handles client-side navigation correctly:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Build & Deployment

### Production Build

```bash
npm run build
```

Output is placed in the `dist/` directory — ready to be deployed to any static host (Vercel, Netlify, etc.).

### Preview Production Build Locally

```bash
npm run preview
```

### Deploy to Vercel

The `vercel.json` is pre-configured. Simply connect the repository to Vercel and set the root directory to `spendfront/`. Vercel will detect Vite and run the build automatically.

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start development server with HMR |
| `build` | `tsc -b && vite build` | Type-check and build for production |
| `preview` | `vite preview` | Preview the production build locally |
| `lint` | `eslint .` | Run ESLint across the project |
