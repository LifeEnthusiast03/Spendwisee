# SpendWise — Backend

> **Node.js · Express · TypeScript · Prisma · PostgreSQL · Redis · OpenAI Agents**

The SpendWise backend is a RESTful API server that handles authentication, financial data management, and an AI-powered multi-agent financial assistant. It is designed to run alongside a PostgreSQL database and a Redis instance (both provided via Docker Compose).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [AI Agent System](#ai-agent-system)
- [API Routes](#api-routes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Scripts](#scripts)

---

## Features

- **Authentication** — Local (email/password with bcrypt) and Google OAuth 2.0 via Passport.js
- **Session Management** — Redis-backed sessions with `connect-redis` + `express-session`
- **Income Tracking** — CRUD operations for income records across 6 categories
- **Expense Tracking** — CRUD operations for expenses across 7 categories
- **Budget Management** — Expense budgets with weekly/monthly/yearly periods and auto-fulfillment tracking
- **Income Goals** — Income targets per category with period-based progress tracking
- **Savings Goals** — Named savings goals with start/end dates and contribution tracking
- **AI Financial Assistant** — A multi-agent system powered by the OpenAI Agents SDK that can:
  - Add/view income and expenses via natural language
  - Create and analyze budgets
  - Manage and track savings goals
  - Manage income goals
  - Give holistic financial advice based on real user data
- **Email Support** — Nodemailer integration (e.g., for OTPs or notifications)
- **Input Validation** — Zod schemas throughout
- **Dockerized** — Fully containerizable with a provided `Dockerfile` and `docker-compose.yml`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Prisma 7 (pg adapter) |
| Database | PostgreSQL |
| Cache / Sessions | Redis 5 + `connect-redis` |
| Auth | Passport.js (Local + Google OAuth 2.0) |
| AI Agents | `@openai/agents` SDK |
| Validation | Zod 4 |
| Email | Nodemailer |
| Dev Server | Nodemon + ts-node (ESM loader) |
| Container | Docker + Docker Compose |

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts                    # App entry: Express setup, middleware, route mounting
│   ├── config/
│   │   └── passport.ts             # Local + Google OAuth Passport strategies
│   ├── controllers/
│   │   ├── income_controllers.ts   # Income CRUD + aggregation logic
│   │   ├── expense_controllers.ts  # Expense CRUD + aggregation logic
│   │   └── goal_controllers.ts     # Savings goals + budget CRUD logic
│   ├── finantial_agant/            # AI multi-agent system
│   │   ├── agent.ts                # ManagerAgent (orchestrator) + genarateResponse()
│   │   ├── income_expense_agent.ts # Handles income/expense add & view
│   │   ├── budget_agent.ts         # Handles expense budget management
│   │   ├── incomegoal_agent.ts     # Handles income goal management
│   │   ├── goal_agent.ts           # Handles savings goal management
│   │   └── finantial_adviser_agent.ts # Holistic financial advice
│   ├── routes/
│   │   ├── auth_route.ts           # /register, /login, /logout, /auth/google
│   │   ├── income_route.ts         # /income endpoints
│   │   ├── expense_route.ts        # /expense endpoints
│   │   ├── goal_route.ts           # /goal + /budget endpoints
│   │   └── chat_route.ts           # POST /chat — AI assistant entry point
│   ├── middleware/
│   │   └── auth_middleware.ts      # isAuthenticated guard
│   ├── lib/
│   │   └── prisma.ts               # Prisma client singleton
│   ├── email/                      # Nodemailer email utilities
│   ├── types/
│   │   └── agent_response.ts       # Shared AgentResponse Zod schema & type
│   └── utils/                      # Shared helper utilities
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Prisma migration history
├── generated/
│   └── prisma/                     # Auto-generated Prisma client
├── docker-compose.yml              # PostgreSQL + Redis Stack services
├── dockerfile                      # Production Docker image
├── entrypoint.sh                   # Container startup script
├── prisma.config.ts                # Prisma configuration
├── tsconfig.json                   # TypeScript config
└── package.json
```

---

## Database Schema

All models are defined in [`prisma/schema.prisma`](./prisma/schema.prisma) using PostgreSQL.

### Models

#### `User`
| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment PK |
| `email` | String | Unique |
| `name` | String? | Optional |
| `googleId` | String? | Unique, Google OAuth |
| `password` | String? | Hashed with bcrypt |

#### `Income`
| Field | Type | Notes |
|---|---|---|
| `amount` | Int | In rupees |
| `category` | IncomeCategory | `SALARY`, `FREELANCE`, `BUSINESS`, `INVESTMENT`, `GIFT`, `OTHER` |
| `note` | String? | Optional memo |
| `date` | DateTime | Transaction date |

#### `Expense`
| Field | Type | Notes |
|---|---|---|
| `amount` | Int | In rupees |
| `category` | ExpenseCategory | `FOOD`, `TRANSPORT`, `RENT`, `SHOPPING`, `ENTERTAINMENT`, `BILLS`, `OTHER` |
| `note` | String? | Optional memo |
| `date` | DateTime | Transaction date |

#### `IncomeGoal`
Period-based income targets per category. Tracks `fulfilledAmount` against `amount`.

#### `ExpenseBudget`
Period-based spending limits per category. Tracks `fulfilledAmount` against `amount`.

#### `Goal` (Savings Goals)
Named savings goals with `startdate`/`enddate`, `amount` (target) and `totalMoney` (saved so far), and an `isActive` flag.

---

## AI Agent System

The assistant uses the **OpenAI Agents SDK** with a **Manager + Specialist** pattern and **Input Guardrails** (e.g., preventing math homework queries). All agents communicate using a shared structured response format (`AgentResponse`).

```
POST /chat
    │
    ▼
ManagerAgent (GPT-4o-mini)
    │
    ├──► IncomeExpenseAgent   — Add income/expenses, view summaries
    ├──► BudgetAgent          — Create/view expense budgets, budget advice
    ├──► IncomeGoalAgent      — Create/view income goals, goal advice
    ├──► GoalAgent            — Create/view savings goals, goal advice
    └──► FinancialAdviserAgent — Holistic financial health & actionable tips
```

### Shared Response Schema (`AgentResponse`)

Every agent returns a structured JSON response that the frontend renders as a UI card:

```typescript
{
  type:    "success" | "error" | "info" | "advice" | "list",
  title:   string,           // Card heading
  summary: string,           // One-line result description
  details?: { label, value }[], // Key/value pairs (for success/info)
  items?:   string[],           // Record list (for list type)
  tips?:    string[],           // Actionable advice (for advice type)
}
```

### Chat Endpoint

```
POST /chat
Authorization: Session cookie (isAuthenticated)

Body:
{
  "query": "Add 5000 salary income",
  "chatHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

Response: AgentResponse JSON object
```

---

## API Routes

### Auth — `/`
| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Register with email/password |
| `POST` | `/login` | Login with email/password |
| `POST` | `/logout` | Destroy session |
| `GET` | `/auth/google` | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `GET` | `/me` | Get current user info |

### Income — `/income`
| Method | Path | Description |
|---|---|---|
| `POST` | `/income` | Add income record |
| `GET` | `/income` | Get all income records |
| `GET` | `/income/summary` | Aggregated income summary |
| `PUT` | `/income/:id` | Update income record |
| `DELETE` | `/income/:id` | Delete income record |

### Expense — `/expense`
| Method | Path | Description |
|---|---|---|
| `POST` | `/expense` | Add expense record |
| `GET` | `/expense` | Get all expense records |
| `GET` | `/expense/summary` | Aggregated expense summary |
| `PUT` | `/expense/:id` | Update expense record |
| `DELETE` | `/expense/:id` | Delete expense record |

### Goals & Budgets — `/goal`, `/budget`, `/incomegoal`
| Method | Path | Description |
|---|---|---|
| `POST` | `/goal` | Create savings goal |
| `GET` | `/goal` | List savings goals |
| `PUT` | `/goal/:id` | Update savings goal |
| `DELETE` | `/goal/:id` | Delete savings goal |
| `POST` | `/budget` | Create expense budget |
| `GET` | `/budget` | List expense budgets |
| `POST` | `/incomegoal` | Create income goal |
| `GET` | `/incomegoal` | List income goals |

### Chat
| Method | Path | Description |
|---|---|---|
| `POST` | `/chat` | Send message to AI assistant |

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/spendwise

# Redis
REDIS_URL=redis://localhost:6379

# Session
SESSION_SECRET=your_super_secret_session_key

# OpenAI
OPENAI_API_KEY=sk-...

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# App
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email (optional)
EMAIL_USER=your@email.com
EMAIL_PASS=your_email_password
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for PostgreSQL + Redis)
- An OpenAI API key

### 1. Start Database & Redis

```bash
cd backend
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Redis Stack** on port `6379` (with RedisInsight UI on `8001`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Migrations

```bash
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs at **http://localhost:3000**

---

## Docker Setup

A production `dockerfile` and `entrypoint.sh` are included.

```bash
# Build the image
docker build -t spendwise-backend .

# Or use docker compose for the full stack
docker compose up --build
```

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `nodemon --exec node --loader ts-node/esm src/index.ts` | Development server with hot reload |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start` | `node dist/index.js` | Run compiled production build |
