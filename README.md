# SpendWise

SpendWise is a full-stack personal finance tracker with session-based authentication, category-wise analytics, and a modern multi-page dashboard UI.

## Current Project Status

Implemented and working:
- Local auth (`register`, `login`) and Google OAuth login
- Session-based protected routes (Passport + `express-session`)
- Logout endpoint that destroys session and clears cookie
- Income and Expense CRUD entry flows (add + list)
- Category-wise totals for income and expense
- Dashboard sections split into dedicated pages:
  - Home
  - Analytics
  - Budget
  - Profile
- Separate Income Form and Expense Form pages
- Premium dark-themed UI with chart visualizations

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router v7, Tailwind v4 |
| Backend | Node.js, Express, TypeScript |
| Auth | Passport Local + Passport Google OAuth + express-session |
| ORM | Prisma |
| Database | PostgreSQL (Docker) |

---

## Project Structure

```txt
Spendwisee/
├─ backend/
│  ├─ src/
│  │  ├─ index.ts
│  │  ├─ config/passport.ts
│  │  ├─ routes/
│  │  │  ├─ auth_route.ts
│  │  │  ├─ income_route.ts
│  │  │  └─ expense_route.ts
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  └─ lib/prisma.ts
│  ├─ prisma/schema.prisma
│  └─ docker-compose.yml
└─ Frontend/
   ├─ src/
   │  ├─ App.tsx
   │  ├─ components/
   │  ├─ hooks/useDashboardData.ts
   │  └─ pages/
   │     ├─ LoginPage.tsx
   │     ├─ SignupPage.tsx
   │     ├─ HomePage.tsx
   │     ├─ AnalyticsPage.tsx
   │     ├─ BudgetPage.tsx
   │     ├─ ProfilePage.tsx
   │     ├─ IncomeFormPage.tsx
   │     └─ ExpenseFormPage.tsx
   └─ vite.config.ts
```

---

## Database Models (Prisma)

Main models currently used:
- `User`
- `Income` (with `IncomeCategory` enum)
- `Expense` (with `ExpenseCategory` enum)

Category enums are defined in `backend/prisma/schema.prisma`.

---

## Backend API (Current)

Base URL: `http://localhost:3000`

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user (creates session)
- `GET /auth/google` - Start Google OAuth
- `GET /auth/google/callback` - Google callback
- `GET /auth/user` - Get current authenticated user profile
- `POST /auth/logout` - Logout + destroy session + clear cookie
- `GET /dashboard` - Protected session check route

### Income
- `GET /income` - Get user income entries
- `POST /addincome` - Add income entry
- `GET /income/total` - Income totals by category
- `GET /income/catagory` - Category-wise income listing/aggregation endpoint

### Expense
- `GET /expense` - Get user expense entries
- `POST /addexpense` - Add expense entry
- `GET /expense/total` - Expense totals by category
- `GET /expense/catagory` - Category-wise expense listing/aggregation endpoint

> Note: Endpoint uses `catagory` spelling in path because current backend code uses that naming.

---

## Frontend Routes (Current)

Base URL: `http://localhost:5173`

Public routes:
- `/login`
- `/signup`

Protected routes:
- `/home` (default app landing)
- `/analytics`
- `/budget`
- `/profile`
- `/income-form`
- `/expense-form`

`/` redirects to `/home`.

---

## Setup Instructions

## 1) Start database

```bash
cd backend
docker compose up -d
```

## 2) Configure backend environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/spendwise"
SESSION_SECRET="your-session-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

## 3) Run migrations

```bash
cd backend
npx prisma migrate dev
```

## 4) Start backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

## 5) Start frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Scripts

### Backend
- `npm run dev` - Start backend in dev mode
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled backend

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview build
- `npm run lint` - Run ESLint

---

## Notes

- Auth depends on browser cookies + `credentials: 'include'` requests.
- Session cookie key is `connect.sid`.
- If login/logout behavior seems inconsistent, clear browser cookies for `localhost` and re-login.
