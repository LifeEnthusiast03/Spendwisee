# SpendWise

A comprehensive full-stack personal finance management application that helps users track income, expenses, set financial goals, manage budgets, and save toward custom savings goals — all with real-time analytics and category-based insights.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
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
- 📈 **Dashboard Analytics**
  - Real-time category-wise income and expense totals
  - Income vs. expense comparison
  - Net savings and balance overview
  - Monthly income vs expense trend (last 6 months)

- 📊 **Visual Reports (Recharts)**
  - Interactive donut/pie charts for income & expense by category
  - Monthly bar charts for income vs. expense trend
  - Horizontal bar charts for category breakdown
  - Custom tooltips and legends

### User Interface
- 💎 Premium dark navy/blue-themed dashboard with glassmorphic effects
- 📱 Responsive multi-page architecture with collapsible sidebar navigation
- ✨ Smooth animations, hover effects, and micro-interactions
- 🧩 Redux Toolkit state management (`authSlice`) for auth, direct API calls for data
- 🔄 Real-time data synchronization on authentication
- 📝 Inter font from Google Fonts for professional typography

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, React Router v6, Vanilla CSS, Redux Toolkit |
| **Backend** | Node.js, Express.js 4, TypeScript |
| **Authentication** | Passport.js (Local Strategy + Google OAuth 2.0), express-session |
| **Database** | PostgreSQL (via Docker) |
| **Session Store** | Redis Stack (via Docker) |
| **ORM** | Prisma |
| **State Management** | Redux Toolkit (`authSlice`) |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Containerization** | Docker & Docker Compose |

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
│   │   │   ├── income_controllers.ts        # Income CRUD + Income Goal CRUD
│   │   │   ├── expense_controllers.ts       # Expense CRUD + Expense Budget CRUD
│   │   │   └── goal_controllers.ts          # Savings Goal CRUD + money management
│   │   ├── routes/
│   │   │   ├── auth_route.ts                # Auth endpoints (register, login, OAuth, logout)
│   │   │   ├── income_route.ts              # Income & Income Goal routes
│   │   │   ├── expense_route.ts             # Expense & Expense Budget routes
│   │   │   └── goal_route.ts                # Savings Goal routes
│   │   ├── middleware/
│   │   │   └── auth_middleware.ts            # isAuthenticated guard
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
│   │   ├── main.tsx                         # React entry point with Redux Provider
│   │   ├── App.tsx                          # Root component with routing
│   │   ├── App.css                          # Main application styles (Navy/Blue theme)
│   │   ├── index.css                        # Global styles
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx           # Auth-guard route wrapper
│   │   │   ├── AppLayout.tsx                # Main layout wrapper (sidebar + content)
│   │   │   └── Sidebar.tsx                  # Collapsible sidebar navigation
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx                # Login (local + Google OAuth)
│   │   │   ├── SignupPage.tsx               # Registration
│   │   │   ├── HomePage.tsx                 # Dashboard overview with stats & recent txns
│   │   │   ├── AnalyticsPage.tsx            # Analytics & insights (Recharts charts)
│   │   │   ├── TransactionsPage.tsx         # Combined Income/Expense management
│   │   │   ├── BudgetsPage.tsx              # Income Goals & Expense Budgets
│   │   │   ├── GoalsPage.tsx                # Savings goals tracking
│   │   │   └── ProfilePage.tsx              # User profile & account
│   │   └── store/
│   │       ├── store.ts                     # Redux store configuration
│   │       ├── hooks.ts                     # Typed useAppDispatch & useAppSelector
│   │       ├── api.ts                       # Axios API instance (withCredentials)
│   │       └── slices/
│   │           └── authSlice.ts             # Auth state & thunks
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
| `DELETE` | `/income/:incomeid` | Delete income entry (balance-validated against expenses + goal commitments) |
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
| `/profile` | User profile & account | Protected |
| `*` | Redirects to `/home` | — |

**Sidebar Navigation** includes: Dashboard, Analytics, Transactions, Budgets, Goals, Profile.

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
```

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
5. Build pages/components in `spendfront/src/pages/` or `spendfront/src/components/`
6. Update the Redux store in `spendfront/src/store/store.ts`

---

## 🚢 Deployment

### Frontend (Vercel)

The `spendfront/vercel.json` is pre-configured for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Simply connect the `spendfront` directory to a Vercel project and deploy.

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
- Ensure `credentials: 'include'` is set on API requests
- Session cookie name is `connect.sid` (maxAge: 24 hours)

### Google OAuth Not Working
- Verify Google OAuth credentials are valid in Google Cloud Console
- Ensure redirect URI matches: `http://localhost:3000/auth/google/callback`
- For production, add the production URL to Google Console

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

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure TypeScript compilation succeeds and follow the existing code structure.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**Copyright © 2026 Sougata Saha**

---

## 🌟 Future Enhancements

- Real-time notifications for budget alerts
- Export financial reports (PDF/CSV)
- Multi-currency support
- Recurring income/expense automation
- Bill reminders and scheduling
- Advanced filtering and search
- Mobile app (React Native)
- Date-range filtering on Analytics page
- API rate limiting for production
