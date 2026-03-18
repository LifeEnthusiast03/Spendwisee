# SpendWise

SpendWise is a full-stack personal finance tracker with session-based authentication, category-wise analytics, income goals, expense budgets, and a modern multi-page dashboard UI.

## Current Project Status

Implemented and working:
- Local auth (`register`, `login`) and Google OAuth login
- Session-based protected routes (Passport + `express-session`)
- Logout endpoint that destroys session and clears cookie
- Income and Expense CRUD entry flows (add + list)
- **Income Goals** - Create weekly/monthly/yearly income targets with progress tracking
- **Expense Budgets** - Create weekly/monthly/yearly spending limits with usage tracking
- Category-wise totals for income and expense
- Goal and budget completion percentage visualizations via pie charts
- Dashboard sections split into dedicated pages:
  - Home
  - Analytics
  - Budget (with goal/budget summary and completion charts)
  - Goals (manage income goals)
  - Limits (manage expense budgets)
  - Profile
- Separate Income Form and Expense Form pages
- Premium dark-themed UI with chart visualizations and smooth animations

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
│  │  │  ├─ income_controllers.ts (with goal controllers)
│  │  │  └─ expense_controllers.ts (with budget controllers)
│  │  ├─ middleware/
│  │  │  └─ auth_middleware.ts
│  │  ├─ lib/
│  │  │  └─ prisma.ts
│  │  ├─ types/
│  │  └─ utils/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ docker-compose.yml
│  ├─ package.json
│  └─ tsconfig.json
└─ Frontend/
   ├─ src/
   │  ├─ App.tsx
   │  ├─ App.css
   │  ├─ components/
   │  │  ├─ TopNavigation.tsx
   │  │  ├─ ProtectedRoute.tsx
   │  │  └─ EntryForm.tsx
   │  ├─ hooks/
   │  │  └─ useDashboardData.ts
   │  ├─ pages/
   │  │  ├─ LoginPage.tsx
   │  │  ├─ SignupPage.tsx
   │  │  ├─ HomePage.tsx
   │  │  ├─ AnalyticsPage.tsx
   │  │  ├─ BudgetPage.tsx
   │  │  ├─ ProfilePage.tsx
   │  │  ├─ IncomeFormPage.tsx
   │  │  ├─ ExpenseFormPage.tsx
   │  │  ├─ IncomeGoalPage.tsx
   │  │  └─ ExpenseBudgetPage.tsx
   │  ├─ assets/
   │  └─ index.css
   └─ vite.config.ts
```

---

## Database Models (Prisma)

Main models:
- `User` - User profile with authentication
- `Income` - Income entries with category
- `Expense` - Expense entries with category
- **IncomeGoal** - User income targets (WEEKLY/MONTHLY/YEARLY)
- **ExpenseBudget** - User spending limits (WEEKLY/MONTHLY/YEARLY)

Enums:
- `IncomeCategory` - SALARY, FREELANCE, BONUS, OTHER
- `ExpenseCategory` - FOOD, TRANSPORT, ENTERTAINMENT, UTILITIES, SHOPPING, HEALTHCARE, EDUCATION, OTHER
- **BudgetType** - WEEKLY, MONTHLY, YEARLY (for goals and budgets)

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
- `DELETE /income/:incomeid` - Delete income entry
- `GET /income/total` - Income totals by category
- `GET /income/catagory` - Category-wise income aggregation

### Income Goals
- `POST /incomegoal` - Create income goal (requires: amount, type)
- `GET /incomegoal` - Get all user income goals
- `GET /incomegoal/:type` - Get specific goal by type (WEEKLY/MONTHLY/YEARLY)
- `PUT /incomegoal/:goalid` - Update income goal
- `DELETE /incomegoal/:goalid` - Delete income goal

### Expense
- `GET /expense` - Get user expense entries
- `POST /addexpense` - Add expense entry
- `DELETE /expense/:expenseid` - Delete expense entry
- `GET /expense/total` - Expense totals by category
- `GET /expense/catagory` - Category-wise expense aggregation

### Expense Budgets
- `POST /expensebudget` - Create expense budget (requires: amount, type)
- `GET /expensebudget` - Get all user expense budgets
- `GET /expensebudget/:type` - Get specific budget by type (WEEKLY/MONTHLY/YEARLY)
- `PUT /expensebudget/:budgetid` - Update expense budget
- `DELETE /expensebudget/:budgetid` - Delete expense budget

---

## Frontend Routes (Current)

Base URL: `http://localhost:5173`

Public routes:
- `/login`
- `/signup`

Protected routes:
- `/home` (default app landing)
- `/analytics`
- `/budget` (transaction filtering + goal/budget summaries + completion charts)
- `/profile`
- `/income-form`
- `/expense-form`
- `/income-goals` (manage income goals)
- `/expense-budget` (manage expense budgets)

Navigation:
- Top nav includes: Home, Analytics, **Add** (dropdown), **Goals**, **Limits**, Budget, Profile

`/` redirects to `/home`.

---

## Setup Instructions

### 1) Start database

```bash
cd backend
docker compose up -d
```

### 2) Configure backend environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/spendwise"
SESSION_SECRET="your-session-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### 3) Run migrations

```bash
cd backend
npx prisma migrate dev
```

### 4) Start backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

### 5) Start frontend

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

## Features Overview

### Income & Expense Tracking
- Add and categorize income/expense entries
- View transaction history with filtering by date, category, type
- Category-wise analytics and aggregation
- Separate forms for streamlined data entry

### Income Goals
- Set weekly, monthly, or yearly income targets
- Track progress against goals
- Visual pie chart showing goal completion percentage
- Easy create/edit/delete management

### Expense Budgets
- Set weekly, monthly, or yearly spending limits
- Track budget usage in real-time
- Visual pie chart showing budget utilization percentage
- Easy create/edit/delete management

### Dashboard & Analytics
- **Home**: Quick overview of balance, recent transactions, and stats
- **Analytics**: Trend charts and category breakdowns
- **Budget**: Filtered transactions, goal/budget summaries, and completion visualizations
- **Profile**: User info and account management
- **Goals**: Dedicated page to manage income goals
- **Limits**: Dedicated page to manage expense budgets

### UI/UX
- Dark theme with gradient accents
- Smooth animations and hover effects
- Responsive design (mobile-optimized)
- Glass morphism and elevation effects
- Professional typography and spacing

---

## Notes

- Auth depends on browser cookies + `credentials: 'include'` requests.
- Session cookie key is `connect.sid`.
- Goals and budgets are calculated on a calendar basis (week starts Monday, month is calendar month, year is calendar year).
- Completion percentages cap at 100% (exceeding goals/budgets shows 100%).
- If login/logout behavior seems inconsistent, clear browser cookies for `localhost` and re-login.
