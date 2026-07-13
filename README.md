# SpendWise

A comprehensive full-stack personal finance management application that helps users track income, expenses, set financial goals, manage budgets, and save toward custom savings goals — all with real-time analytics, category-based insights, and a fully cached state layer using Redux Toolkit + TanStack Query.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [State Management Architecture](#-state-management-architecture)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Frontend Routes](#-frontend-routes)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Authentication & Security
- ✅ Local authentication (register/login with bcrypt password hashing)
- ✅ Google OAuth 2.0 integration
- ✅ Session-based authentication (Passport.js + express-session)
- ✅ Redis-backed session storage for scalability
- ✅ Secure logout with session destruction and cookie clearing
- ✅ Protected routes with authentication middleware
- ✅ Transactional email notifications via Nodemailer + Gmail OAuth2:
  - 🎉 Welcome email on registration (local) and first-time Google sign-up
  - 🔒 Login notification email on every successful sign-in (local password & Google OAuth)

### Financial Tracking
- 💰 **Income Management**
  - Add and delete income entries
  - Category-based income tracking (Salary, Freelance, Business, Investment, Gift, Other)
  - Custom date support or auto-timestamping
  - Category-wise income aggregation and totals

- 💸 **Expense Management**
  - Add and delete expense entries
  - Expense categorization (Food, Transport, Rent, Shopping, Entertainment, Bills, Other)
  - Balance validation — prevents expenses exceeding available income minus goal commitments
  - Category-wise expense aggregation and totals

### Income Goals & Expense Budgets
- 🎯 **Income Goals**
  - Create weekly, monthly, or yearly income targets per category
  - Automatic fulfillment tracking — adding income auto-increments matching active goals
  - Period-based overlap detection to prevent duplicate goals
  - Active status determined by periodStart/periodEnd date range

- 📊 **Expense Budgets**
  - Set weekly, monthly, or yearly spending limits per category
  - Automatic spending tracking — adding expenses auto-increments matching active budgets
  - Period-based overlap detection to prevent duplicate budgets
  - Budget utilization tracking

### Savings Goals
- 🏷️ **Custom Savings Goals**
  - Create named savings goals with target amounts and start/end date ranges
  - Add/remove money to/from individual goals (balance-checked against income - expenses)
  - Bulk money removal from multiple goals in a single transaction
  - Duplicate name prevention for active goals
  - Goal progress tracking (totalMoney vs. target amount)

### Analytics & Insights
- 📈 **Professional Financial Dashboard** (Stripe / Linear inspired)
  - Sticky frosted-glass page header with date-range filter (This Month / Last 3 / Last 6 / All Time)
  - 4 structured KPI cards — Total Income, Total Expenses, Net Savings, Savings Rate
    - Each card: label + icon, large tabular-nums value, change-vs-prev-month badge pill, colored bottom accent
    - Savings Rate card: inline SVG half-arc radial progress indicator (green / amber / red)
  - Real-time category-wise income and expense totals
  - Net savings and balance overview

- 📊 **Visual Reports (Recharts)**
  - `ComposedChart` — Income & Expense bars with a Net Savings line overlay (amber) and zero reference line
  - Interactive donut charts with total amount shown in the center hole (no overlapping slice labels)
  - 2-column pie legends with color dot, name, amount, and mini percentage bar per category
  - Horizontal bar charts for category breakdown
  - Animated shimmer skeleton loaders while data fetches
  - Fade + slide-up entrance animation on all chart cards (staggered delays)
  - Icon + title + subtitle empty states

### AI Chat Assistant
- 🤖 **SpendWise AI — Full-page Chat Interface**
  - Dedicated `/chat` route featuring a premium, full-height conversational UI
  - Fully responsive: 100dvh mobile safe-area layout and centered max-width on desktop
  - Markdown support for AI responses (bolding, italics, bulleted lists)
  - Auto-growing `<textarea>` composer with `Enter` (send) and `Shift+Enter` (new line) support
  - Distinct Agent Response Cards for structured data (`success`, `info`, `error`, `advice`, `list`)
  - Smooth auto-scroll behavior that intelligently pauses if the user scrolls up
  - Three-dot bounce typing indicator while the bot is processing

### User Interface
- 💎 **Premium Fintech Aesthetics**: High-end dark navy theme with glassmorphic effects, split-screen auth layouts, and abstract geometric motifs
- 📱 **Responsive Architecture**: Multi-page layout with a collapsible sidebar and mobile-first column reordering
- 🎨 **Custom SVG Logo**: Scalable geometric badge logo integrated seamlessly across the app and browser favicon
- ✨ Smooth animations, hover effects, interactive focus rings, and dynamic button loading states
- 🧩 Full Redux Toolkit state management across all pages (4 slices)
- ⚡ TanStack Query (React Query) for cached API calls with 5-minute stale time
- 🗂️ Centralized TypeScript types in `src/types/types.ts`
- 🔄 Zero duplicate network requests — shared query cache across pages
- 📝 Inter & Plus Jakarta Sans fonts for professional, balanced typography
- 👤 Enhanced Profile page with financial snapshot, savings rate, and activity stats

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, React Router v7, Vanilla CSS |
| **Backend** | Node.js, Express.js 4, TypeScript |
| **Authentication** | Passport.js (Local Strategy + Google OAuth 2.0), express-session |
| **Database** | PostgreSQL (via Docker) |
| **Session Store** | Redis Stack (via Docker) |
| **ORM** | Prisma |
| **Email Service** | Nodemailer + Gmail OAuth2 (welcome & login notifications) |
| **State Management** | Redux Toolkit (4 slices: auth, transaction, goal, budget) |
| **Server State / Caching** | TanStack Query v5 (React Query) |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Containerization** | Docker & Docker Compose |

---

## 🏛 Architecture Overview

The diagram below shows the **complete system architecture** of SpendWise — from the user's browser all the way through the frontend state layers, REST API, authentication, and data persistence.

```mermaid
flowchart TD
    subgraph BROWSER["🌐 Browser / Client"]
        USER(["👤 User"])
    end

    subgraph FRONTEND["⚛️ Frontend — React 19 + Vite (localhost:5173)"]
        direction TB

        subgraph PAGES["📄 Pages"]
            PUB["Public Pages\n/login · /signup"]
            PROT["Protected Pages\n/home · /analytics · /transactions\n/budgets · /goals · /profile · /chat"]
        end

        subgraph ROUTING["🔀 Routing"]
            RR["React Router v7\nProtectedRoute wrapper"]
        end

        subgraph STATE["🗂 State Management"]
            direction LR
            subgraph REDUX["Redux Toolkit"]
                AS["authSlice\n(user, isAuthenticated)"]
                TS["transactionSlice\n(tab, form fields)"]
                GS["goalSlice\n(modal, form fields)"]
                BS["budgetSlice\n(tab, form fields)"]
            end
            subgraph RQ["TanStack Query v5"]
                RQC["QueryClient\n5-min stale time"]
                RQH["Custom Hooks\nuseTransactionQueries\nuseGoalQueries\nuseBudgetQueries"]
            end
        end

        subgraph HTTP_CLIENT["🌐 HTTP Layer"]
            AX["Axios Instance\n(withCredentials: true)"]
        end
    end

    subgraph BACKEND["🖥 Backend — Express.js + Node.js (localhost:3000)"]
        direction TB

        subgraph AUTH_LAYER["🔐 Auth Layer"]
            PP["Passport.js"]
            LOCAL["Local Strategy\n(bcrypt)"]
            GOOGLE["Google OAuth 2.0"]
            SESSION["express-session\n(24h maxAge)"]
        end

        subgraph MIDDLEWARE["🛡 Middleware"]
            AUTHMW["isAuthenticated guard"]
            CORS["CORS (FRONTEND_URL)"]
        end

        subgraph ROUTES["🛣 Routes"]
            AR["auth_route\n/auth/*"]
            IR["income_route\n/income · /addincome"]
            ER["expense_route\n/expense · /addexpense"]
            IGR["income_goal_route\n/incomegoal"]
            EBR["expense_budget_route\n/expensebudget"]
            GR["goal_route\n/goal"]
            CR["chat_route\n/chat"]
        end

        subgraph CONTROLLERS["⚙️ Controllers"]
            IC["income_controllers\nCRUD + category totals"]
            EC["expense_controllers\nCRUD + balance validation"]
            IGC["income_goal_controllers\nCRUD + overlap detection"]
            EBC["expense_budget_controllers\nCRUD + utilization tracking"]
            GC["goal_controllers\nCRUD + addMoney / removeMoney"]
            AI["AI Chat\n(chat_route)"]
        end

        subgraph UTILS["🔧 Utils"]
            CWD["catagorywisedata.ts\nCategory aggregation"]
            CC["cheakcatgory.ts\nCategory validation"]
        end

        subgraph EMAIL_SVC["📧 Email Service"]
            TRANS["Nodemailer\n+ Gmail OAuth2"]
            WELC["Welcome Email\n(on register)"]
            LOGIN_EMAIL["Login Notification\n(on every sign-in)"]
        end
    end

    subgraph DATA["🗄 Data Layer"]
        direction LR
        subgraph POSTGRES["🐘 PostgreSQL (Docker :5432)"]
            PRISMA["Prisma ORM\n(schema + migrations)"]
            subgraph MODELS["DB Models"]
                UM["User"]
                INC["Income"]
                EXP["Expense"]
                INGG["IncomeGoal"]
                EXPB["ExpenseBudget"]
                GOAL["Goal (Savings)"]
            end
        end
        subgraph REDIS["⚡ Redis Stack (Docker :6379)"]
            SESS["Session Store\n(connect-redis)"]
        end
    end

    %% User interaction flow
    USER -->|"navigates to"| PUB
    USER -->|"after login"| PROT
    PUB --> RR
    PROT --> RR
    RR --> STATE
    STATE --> HTTP_CLIENT
    HTTP_CLIENT -->|"HTTP + cookie"| BACKEND

    %% Auth flow
    AR --> PP
    PP --> LOCAL
    PP --> GOOGLE
    PP --> SESSION
    SESSION -->|"stores session ID"| SESS
    GOOGLE -->|"OAuth callback"| AR

    %% Request pipeline
    HTTP_CLIENT --> MIDDLEWARE
    MIDDLEWARE --> AUTHMW
    AUTHMW -->|"authenticated"| ROUTES
    AUTHMW -->|"401 rejected"| HTTP_CLIENT

    %% Route → Controller wiring
    IR --> IC
    ER --> EC
    IGR --> IGC
    EBR --> EBC
    GR --> GC
    CR --> AI

    %% Controller → Prisma → DB
    IC --> PRISMA
    EC --> PRISMA
    IGC --> PRISMA
    EBC --> PRISMA
    GC --> PRISMA
    IC --> CWD
    EC --> CWD
    EC --> CC
    IC --> CC
    PRISMA --> MODELS

    %% Auto-update side-effects
    IC -->|"auto-increments matching\nactive IncomeGoal"| IGC
    EC -->|"auto-increments matching\nactive ExpenseBudget"| EBC

    %% Email triggers
    PP -->|"on register / first Google sign-up"| WELC
    PP -->|"on every login"| LOGIN_EMAIL
    WELC --> TRANS
    LOGIN_EMAIL --> TRANS
    TRANS -->|"Gmail OAuth2"| USER

    %% TanStack Query cache invalidation loop
    RQH -->|"mutation → invalidateQueries"| RQC
    RQC -->|"refetch"| HTTP_CLIENT

    %% Redux dispatch loop
    AS -->|"checkAuth / logout thunks"| AX
    AX --> AR

    %% Styling
    classDef frontend fill:#1e3a5f,stroke:#4a9eff,color:#e0f0ff
    classDef backend fill:#1a3a2a,stroke:#4aff8a,color:#e0ffe8
    classDef data fill:#3a1a3a,stroke:#cc55ff,color:#f0e0ff
    classDef browser fill:#2a2a1a,stroke:#ffcc44,color:#fffae0
    class PAGES,ROUTING,STATE,HTTP_CLIENT,REDUX,RQ,AS,TS,GS,BS,RQC,RQH,AX,PUB,PROT,RR frontend
    class AUTH_LAYER,MIDDLEWARE,ROUTES,CONTROLLERS,UTILS,EMAIL_SVC,PP,LOCAL,GOOGLE,SESSION,AUTHMW,CORS,AR,IR,ER,IGR,EBR,GR,CR,IC,EC,IGC,EBC,GC,AI,CWD,CC,TRANS,WELC,LOGIN_EMAIL backend
    class DATA,POSTGRES,REDIS,PRISMA,MODELS,UM,INC,EXP,INGG,EXPB,GOAL,SESS data
    class BROWSER,USER browser
```

### Architecture Summary

| Layer | Role |
|-------|------|
| **Browser** | User interaction entry point |
| **React Router v7** | Guards protected routes via `ProtectedRoute` |
| **Redux Toolkit** | UI & ephemeral client state (forms, tabs, modals, auth) |
| **TanStack Query v5** | Server state caching, auto-invalidation on mutations |
| **Axios** | HTTP client with `withCredentials` for session cookies |
| **Passport.js** | Local (bcrypt) + Google OAuth 2.0 authentication |
| **express-session + Redis** | Server-side session persistence |
| **Express Controllers** | Business logic, balance validation, auto-goal tracking |
| **Prisma ORM** | Type-safe database access + migrations |
| **PostgreSQL** | Primary relational data store |
| **Nodemailer + Gmail OAuth2** | Transactional welcome & login notification emails |

---

## 📁 Project Structure

```
Spendwisee/
├── backend/
│   ├── src/
│   │   ├── index.ts                         # Express server entry point
│   │   ├── config/
│   │   │   └── passport.ts                  # Passport strategies (Local + Google)
│   │   ├── controllers/
│   │   │   ├── income_controllers.ts        # Income CRUD
│   │   │   ├── income_goal_controllers.ts   # Income Goal CRUD
│   │   │   ├── expense_controllers.ts       # Expense CRUD
│   │   │   ├── expense_budget_controllers.ts# Expense Budget CRUD
│   │   │   └── goal_controllers.ts          # Savings Goal CRUD + money management
│   │   ├── routes/
│   │   │   ├── auth_route.ts                # Auth endpoints (register, login, OAuth, logout)
│   │   │   ├── income_route.ts              # Income routes
│   │   │   ├── income_goal_route.ts         # Income Goal routes
│   │   │   ├── expense_route.ts             # Expense routes
│   │   │   ├── expense_budget_route.ts      # Expense Budget routes
│   │   │   ├── goal_route.ts                # Savings Goal routes
│   │   │   └── chat_route.ts                # AI chat route
│   │   ├── email/                           # ★ Email notification service
│   │   │   ├── transporter.ts               # Nodemailer + Gmail OAuth2 transport
│   │   │   ├── emailService.ts              # sendWelcomeEmail() & sendLoginEmail()
│   │   │   └── templates/
│   │   │       ├── welcome.ts               # Welcome email HTML template
│   │   │       └── login.ts                 # Login notification HTML template
│   │   ├── middleware/
│   │   │   └── auth_middleware.ts           # isAuthenticated guard
│   │   ├── lib/
│   │   │   └── prisma.ts                    # Prisma client singleton
│   │   ├── types/
│   │   │   └── type.ts                      # TypeScript interfaces & Express augmentation
│   │   └── utils/
│   │       ├── catagorywisedata.ts           # Category-wise data aggregation
│   │       └── cheakcatgory.ts               # Category validation utilities
│   ├── prisma/
│   │   ├── schema.prisma                    # Database schema
│   │   └── migrations/                      # Database migrations
│   ├── docker-compose.yml                   # PostgreSQL + Redis Stack services
│   ├── package.json
│   └── tsconfig.json
├── spendfront/
│   ├── src/
│   │   ├── main.tsx                         # React entry point (Redux + QueryClient + Router)
│   │   ├── App.tsx                          # Root component with routing
│   │   ├── App.css                          # Main application styles (Navy/Blue theme)
│   │   ├── index.css                        # Global styles
│   │   ├── types/
│   │   │   └── types.ts                     # ★ Centralized shared TypeScript types
│   │   ├── hooks/                           # ★ React Query custom hooks
│   │   │   ├── useTransactionQueries.ts     # Income & Expense queries + mutations
│   │   │   ├── useGoalQueries.ts            # Savings Goal queries + mutations
│   │   │   └── useBudgetQueries.ts          # Income Goal & Expense Budget queries + mutations
│   │   ├── lib/
│   │   │   └── queryClient.ts               # TanStack QueryClient (5-min stale time)
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx           # Auth-guard route wrapper
│   │   │   ├── AppLayout.tsx                # Main layout wrapper (sidebar + content)
│   │   │   ├── Sidebar.tsx                  # Collapsible sidebar with SVG logo
│   │   │   └── Logo.tsx                     # ★ Custom scalable SVG geometric logo component
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx                # ★ Premium split-screen Login (local + Google OAuth)
│   │   │   ├── SignupPage.tsx               # ★ Premium split-screen Registration
│   │   │   ├── HomePage.tsx                 # Dashboard — uses cached income/expense data
│   │   │   ├── AnalyticsPage.tsx            # Redesigned financial dashboard — KPI cards, ComposedChart
│   │   │   ├── TransactionsPage.tsx         # Income/Expense — Redux form state + RQ data
│   │   │   ├── BudgetsPage.tsx              # Income Goals & Expense Budgets — Redux + RQ
│   │   │   ├── GoalsPage.tsx                # Savings goals — Redux modal state + RQ data
│   │   │   ├── ChatPage.tsx                 # ★ Full-page AI Chat interface with Markdown support
│   │   │   └── ProfilePage.tsx              # Enhanced profile with financial snapshot
│   │   └── store/
│   │       ├── store.ts                     # Redux store (auth + transaction + goal + budget)
│   │       ├── hooks.ts                     # Typed useAppDispatch & useAppSelector
│   │       ├── api.ts                       # Axios instance (withCredentials)
│   │       └── slices/
│   │           ├── authSlice.ts             # Auth state & thunks (checkAuth, logout)
│   │           ├── transactionSlice.ts      # ★ TransactionsPage UI state (tab, form fields)
│   │           ├── goalSlice.ts             # ★ GoalsPage UI state (form fields, money modal)
│   │           └── budgetSlice.ts           # ★ BudgetsPage UI state (tab, form fields)
│   ├── public/                              # Static files
│   ├── index.html                           # HTML entry point
│   ├── vite.config.ts
│   ├── vercel.json                          # Vercel SPA routing config (rewrites → index.html)
│   ├── tsconfig.json
│   ├── eslint.config.js
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🏗 State Management Architecture

SpendWise uses a **two-layer state management** approach:

### Layer 1 — Redux Toolkit (UI State)

Manages ephemeral, client-side UI state that doesn't need to be fetched from the server.

| Slice | Manages |
|-------|---------|
| `authSlice` | Authenticated user object, `isAuthenticated`, loading state |
| `transactionSlice` | Active tab (income/expense), form field values in TransactionsPage |
| `goalSlice` | Create-goal form fields, money-modal open/close state |
| `budgetSlice` | Active tab (income/expense), form field values in BudgetsPage |

### Layer 2 — TanStack Query (Server State + Caching)

Manages all API data with automatic caching, deduplication, and invalidation.

| Hook | Endpoint | Cache Key |
|------|----------|-----------|
| `useIncomes()` | `GET /income` | `['incomes']` |
| `useIncomeTotals()` | `GET /income/total` | `['income-totals']` |
| `useExpenses()` | `GET /expense` | `['expenses']` |
| `useExpenseTotals()` | `GET /expense/total` | `['expense-totals']` |
| `useGoals()` | `GET /goal` | `['goals']` |
| `useIncomeGoals()` | `GET /incomegoal` | `['income-goals']` |
| `useExpenseBudgets()` | `GET /expensebudget` | `['expense-budgets']` |

**Key behaviors:**
- **5-minute cache** — navigating between pages re-uses cached data, no repeat requests
- **Shared cache** — `HomePage` and `AnalyticsPage` both use `['incomes']`/`['expenses']`, so visiting one page pre-populates the other
- **Auto-invalidation** — every mutation (`add`/`delete`) calls `queryClient.invalidateQueries()` on affected keys, triggering a background refetch
- **All types centralized** — `src/types/types.ts` is the single source of truth for `IncomeRecord`, `ExpenseRecord`, `Goal`, `IncomeGoal`, `ExpenseBudget`, `CategoryTotals`, `BudgetType`, `UserProfile`, `CategoryData`

---

## 🗄️ Database Schema

### Models

#### User
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK, auto-increment) | Unique user identifier |
| email | String (unique) | User email address |
| name | String? | Full name (optional) |
| googleId | String? (unique) | Google OAuth ID |
| password | String? | Bcrypt hashed password |

**Relations**: Incomes, Expenses, IncomeGoals, ExpenseBudgets, Goals

#### Income
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incremented ID |
| amount | Int | Income amount (default: 0) |
| category | IncomeCategory | Income category enum |
| note | String? | Optional description |
| date | DateTime | Income date (default: now) |
| userId | Int (FK) | Associated user |

**Indexes**: `[userId, date]`

#### Expense
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incremented ID |
| amount | Int | Expense amount (default: 0) |
| category | ExpenseCategory | Expense category enum |
| note | String? | Optional description |
| date | DateTime | Expense date (default: now) |
| userId | Int (FK) | Associated user |

**Indexes**: `[userId, date]`

#### IncomeGoal
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incremented ID |
| category | IncomeCategory | Target income category |
| amount | Int | Target income amount |
| fulfilledAmount | Int | Current progress toward goal |
| type | BudgetType | WEEKLY / MONTHLY / YEARLY |
| periodStart | DateTime | Goal period start |
| periodEnd | DateTime | Goal period end |
| userId | Int (FK) | Associated user |

**Active status** is computed on the frontend: `now >= periodStart && now <= periodEnd`

**Indexes**: `[userId, type]`, `[userId, category]`

#### ExpenseBudget
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incremented ID |
| category | ExpenseCategory | Budget category |
| amount | Int | Spending limit |
| fulfilledAmount | Int | Current spending against budget |
| type | BudgetType | WEEKLY / MONTHLY / YEARLY |
| periodStart | DateTime | Budget period start |
| periodEnd | DateTime | Budget period end |
| userId | Int (FK) | Associated user |

**Active status** is computed on the frontend: `now >= periodStart && now <= periodEnd`

**Indexes**: `[userId, type]`, `[userId, category]`

#### Goal (Savings Goal)
| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Auto-incremented ID |
| name | String | Goal name (normalized to lowercase) |
| amount | Int | Target savings amount |
| totalMoney | Int | Money saved so far |
| startdate | DateTime | Goal start date |
| enddate | DateTime | Goal target end date |
| isActive | Boolean | Goal active status |
| userId | Int (FK) | Associated user |

**Indexes**: `[userId]`, `[userId, isActive]`

### Enums

| Enum | Values |
|------|--------|
| **IncomeCategory** | `SALARY`, `FREELANCE`, `BUSINESS`, `INVESTMENT`, `GIFT`, `OTHER` |
| **ExpenseCategory** | `FOOD`, `TRANSPORT`, `RENT`, `SHOPPING`, `ENTERTAINMENT`, `BILLS`, `OTHER` |
| **BudgetType** | `WEEKLY`, `MONTHLY`, `YEARLY` |

All models include `createdAt` / `updatedAt` timestamps and cascade-delete from User.

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login (creates session via Passport Local) |
| `POST` | `/auth/logout` | Logout + destroy session + clear cookie |
| `GET` | `/auth/user` | Get current authenticated user profile |
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | Google OAuth callback |

### Income

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/income` | Get all user income entries |
| `POST` | `/addincome` | Add new income entry (auto-updates matching active income goals) |
| `DELETE` | `/income/:incomeid` | Delete income entry |
| `GET` | `/income/total` | Get category-wise income totals `{ CATEGORY: amount }` |
| `GET` | `/income/catagory` | Get income filtered by category (query: `?catagory=SALARY`) |

### Income Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/incomegoal` | Create income goal (requires: amount, type, catagory) |
| `GET` | `/incomegoal` | Get all user income goals |
| `GET` | `/incomegoal/category/:category` | Get income goals by category |
| `PUT` | `/incomegoal/:goalid` | Update income goal (amount, type) |
| `DELETE` | `/incomegoal/:goalid` | Delete income goal |

### Expense

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/expense` | Get all user expense entries |
| `POST` | `/addexpense` | Add new expense entry (balance-validated, auto-updates matching active budgets) |
| `DELETE` | `/expense/:expenseid` | Delete expense entry |
| `GET` | `/expense/total` | Get category-wise expense totals `{ CATEGORY: amount }` |
| `GET` | `/expense/catagory` | Get expenses filtered by category (query: `?catagory=FOOD`) |

### Expense Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/expensebudget` | Create expense budget (requires: amount, type, catagory) |
| `GET` | `/expensebudget` | Get all user expense budgets |
| `GET` | `/expensebudget/category/:category` | Get expense budgets by category |
| `PUT` | `/expensebudget/:budgetid` | Update expense budget (amount, type) |
| `DELETE` | `/expensebudget/:budgetid` | Delete expense budget |

### Savings Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/goal` | Get all user savings goals |
| `POST` | `/goal` | Create savings goal (requires: name, amount, startdate, enddate) |
| `PUT` | `/goal/:goalid` | Update goal (amount, enddate only) |
| `DELETE` | `/goal/:goalid` | Delete savings goal |
| `POST` | `/goal/:goalid/addmoney` | Add money to a goal (balance-checked) |
| `POST` | `/goal/:goalid/removemoney` | Remove money from a goal |
| `POST` | `/goal/removemoney` | Bulk remove money from multiple goals (transactional) |
| `GET` | `/goal/:goalid/totalmoney` | Get goal progress details |

> **Note:** All routes except auth endpoints require authentication via `isAuthenticated` middleware.

---

## 🗺️ Frontend Routes

Base URL: `http://localhost:5173`

| Route | Page | Access |
|-------|------|--------|
| `/` | Redirects to `/home` | — |
| `/login` | Login page | Public |
| `/signup` | Registration page | Public |
| `/home` | Dashboard overview | Protected |
| `/analytics` | Analytics & insights (Recharts) | Protected |
| `/transactions` | Income & Expense unified view | Protected |
| `/budgets` | Income Goals & Expense Budgets | Protected |
| `/goals` | Savings goals management | Protected |
| `/profile` | Enhanced profile with financial snapshot | Protected |
| `*` | Redirects to `/home` | — |

**Sidebar Navigation** includes: Dashboard, Analytics, Transactions, Budgets, Goals, AI Chat, Profile.
The sidebar collapse toggle is located in the brand header row (top-left). When collapsed, only the expand button is shown — click it to restore the full sidebar.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v18 or later
- **npm** or **yarn**
- **Docker & Docker Compose** (for PostgreSQL + Redis)

### 1. Clone the Repository
```bash
git clone https://github.com/LifeEnthusiast03/Spendwisee.git
cd Spendwisee
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file (see [Environment Variables](#-environment-variables) below).

Start PostgreSQL and Redis via Docker:
```bash
docker compose up -d
```

Run database migrations:
```bash
npx prisma migrate dev
```

### 3. Frontend Setup

```bash
cd spendfront
npm install
```

Create `spendfront/.env` if required (see below).

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/spendwise"

# Session
SESSION_SECRET="your-session-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Server
NODE_ENV="development"
PORT="3000"

# Redis (optional — defaults to redis://localhost:6379)
REDIS_URL="redis://localhost:6379"

# Email Service (Nodemailer + Gmail OAuth2)
GMAIL_USER="your-gmail-address@gmail.com"
GMAIL_CLIENT_ID="your-gmail-oauth-client-id"
GMAIL_CLIENT_SECRET="your-gmail-oauth-client-secret"
GMAIL_REFRESH_TOKEN="your-gmail-oauth-refresh-token"
```

> 💡 **Gmail OAuth2 setup:** Go to Google Cloud Console → Credentials → OAuth 2.0 → generate a refresh token with `https://mail.google.com/` scope. The email service uses this to send transactional emails without storing a plaintext password.

### Frontend (`spendfront/.env`)
```env
VITE_API_URL="http://localhost:3000"
```

> ⚠️ **Never commit `.env` files.** Use `.env.example` templates instead.

---

## ▶️ Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:3000`

### Start Frontend
```bash
cd spendfront
npm run dev
```
Frontend runs on `http://localhost:5173`

### Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd spendfront
npm run build
npm run preview
```

### Docker Services

```bash
# Start PostgreSQL + Redis
cd backend
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check running containers
docker ps
```

---

## 🔧 Development Workflow

### Available Scripts

**Backend:**
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon + ts-node (ESM) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build (`dist/index.js`) |

**Frontend:**
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Prisma Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ destroys all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Adding New Features

1. Define the database schema in `backend/prisma/schema.prisma`
2. Create a migration — `npx prisma migrate dev --name feature_name`
3. Add controller logic in `backend/src/controllers/`
4. Register routes in `backend/src/routes/`
5. **Add shared types** to `spendfront/src/types/types.ts`
6. **Create React Query hooks** in `spendfront/src/hooks/`
7. **Add a Redux slice** for UI state in `spendfront/src/store/slices/` (if needed)
8. Register the new reducer in `spendfront/src/store/store.ts`
9. Build pages/components in `spendfront/src/pages/` or `spendfront/src/components/`

---

## 🚢 Deployment

### Frontend (Vercel)

The `spendfront/vercel.json` is pre-configured for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Simply connect the `spendfront` directory to a Vercel project and set the `VITE_API_URL` environment variable in Vercel's project settings.

### Backend (Docker)

1. Build Docker images:
```bash
docker build -t spendwise-backend ./backend
```

2. Run with Docker Compose:
```bash
docker compose up -d
```

### Production Checklist

- [ ] Generate a strong `SESSION_SECRET` (`openssl rand -base64 32`)
- [ ] Set `NODE_ENV="production"`
- [ ] Use a managed PostgreSQL service (AWS RDS, GCP Cloud SQL, etc.)
- [ ] Configure CORS for your production domain
- [ ] Enable HTTPS/SSL
- [ ] Set secure session cookies (`secure: true`)
- [ ] Configure proper database backups
- [ ] Set up monitoring and logging
- [ ] Use environment variables for all secrets
- [ ] Set `VITE_API_URL` to production backend URL in Vercel environment settings
- [ ] Test authentication flows in staging before going live

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure Docker is running: `docker ps`
- Verify containers are up: `docker compose ps`
- Check `DATABASE_URL` in `.env` matches your setup
- Restart: `docker compose down && docker compose up -d`

### Session / Auth Not Working
```
401 Unauthorized or session lost after refresh
```
- Clear browser cookies (DevTools → Application → Cookies → Clear localhost)
- Check browser allows third-party cookies
- Verify `FRONTEND_URL` in backend `.env` matches actual frontend URL
- Ensure `credentials: 'include'` is set on API requests (handled by `store/api.ts`)
- Session cookie name is `connect.sid` (maxAge: 24 hours)

### React Query Cache Issues
- Open DevTools Network tab and check if the same endpoint is being called multiple times
- The `queryClient` in `src/lib/queryClient.ts` has a 5-minute `staleTime`
- After a mutation, the cache is automatically invalidated via `queryClient.invalidateQueries()`
- To force a fresh fetch, you can call `queryClient.resetQueries()` from DevTools console

### Google OAuth Not Working
- Verify Google OAuth credentials are valid in Google Cloud Console
- Ensure redirect URI matches: `http://localhost:3000/auth/google/callback`
- For production, add the production URL to Google Console

### Email Notifications Not Sending
```
Error: Invalid login / authentication failed
```
- Verify all four `GMAIL_*` variables are set correctly in `backend/.env`
- Ensure the Gmail OAuth2 refresh token has the `https://mail.google.com/` scope
- Confirm the refresh token hasn't expired — regenerate from Google OAuth Playground if needed
- Email failures are non-blocking; check backend console for `[EmailService]` log lines
- Login/registration will still succeed even if the email fails

### Prisma Migration Issues
```bash
# Reset database (⚠️ destroys data)
npx prisma migrate reset

# Or deploy existing migrations
npx prisma migrate deploy
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000

# macOS / Linux
lsof -i :3000
```

### Frontend Build Errors
```bash
cd spendfront
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript Type Errors on Import
All shared types live in `spendfront/src/types/types.ts`. If you see a `Module has no exported member` error, check that:
1. The type is defined and **exported** from `types/types.ts`
2. The importing file uses `import type { ... } from '../types/types'`
3. No file is re-importing a type from a slice file (slices only export actions/reducers)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- TypeScript compilation succeeds (`npx tsc --noEmit`)
- New types are added to `spendfront/src/types/types.ts`
- New API calls use React Query hooks in `spendfront/src/hooks/`
- New UI-only state goes into a Redux slice

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**Copyright © 2026 Sougata Saha**

---

## 🌟 Future Enhancements

- 🔗 **SpendWise AI backend** — connect the chat widget to a real LLM (Gemini / OpenAI) for personalized financial insights
- 📬 Real-time notifications for budget alerts
- 📤 Export financial reports (PDF/CSV)
- 💱 Multi-currency support
- 🔁 Recurring income/expense automation
- ⏰ Bill reminders and scheduling
- 🔍 Advanced filtering and search by date range and category
- 📱 Mobile app (React Native)
- 🛡️ API rate limiting for production
- 🌗 Dark/light theme toggle
