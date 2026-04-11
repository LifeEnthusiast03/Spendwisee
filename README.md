# SpendWise

A comprehensive full-stack personal finance management application that helps users track income, expenses, set financial goals, and manage budgets with real-time analytics and category-based insights.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)

---

## ✨ Features

### Authentication & Security
- ✅ Local authentication (register/login with bcrypt password hashing)
- ✅ Google OAuth 2.0 integration
- ✅ Session-based authentication (Passport.js + express-session)
- ✅ Redis-backed session storage
- ✅ Secure logout with session destruction
- ✅ Protected routes with role-based access

### Financial Tracking
- 💰 **Income Management**
  - Add, edit, delete income entries
  - Category-based income tracking (Salary, Freelance, Business, Investment, Gift, Other)
  - Automatic date timestamping
  - Income history and list view

- 💸 **Expense Management**
  - Add, edit, delete expense entries
  - Expense categorization (Food, Transport, Rent, Shopping, Entertainment, Bills, Other)
  - Expense analytics and tracking
  - Expense history and list view

### Financial Goals & Budgeting
- 🎯 **Income Goals**
  - Create weekly, monthly, or yearly income targets
  - Category-specific income goals
  - Progress tracking with fulfillment percentage
  - Active/inactive goal status management

- 📊 **Expense Budgets**
  - Set weekly, monthly, or yearly spending limits
  - Category-specific budget management
  - Budget utilization tracking
  - Budget completion percentage visualization

### Analytics & Insights
- 📈 **Dashboard Analytics**
  - Real-time category-wise income and expense totals
  - Income vs. Expense comparison
  - Goal completion status with pie charts
  - Budget usage visualization
  - Period-based filtering (weekly, monthly, yearly)

- 📊 **Visual Reports**
  - Interactive pie charts for goal progress
  - Budget utilization charts
  - Category breakdown visualizations
  - Dark-themed glassmorphic UI with smooth animations

### User Interface
- 🎨 Premium dark-themed dashboard
- 📱 Multi-page responsive design
- ✨ Glassmorphic animations and transitions
- 🔄 Redux-based state management with strongly-typed slices
- ⚡ Real-time data synchronization

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router v7, Tailwind CSS v4, Redux Toolkit |
| **Backend** | Node.js, Express.js, TypeScript |
| **Authentication** | Passport.js (Local + Google OAuth 2.0), express-session |
| **Database** | PostgreSQL |
| **Session Storage** | Redis |
| **ORM** | Prisma |
| **Styling** | Tailwind CSS with dark mode |
| **State Management** | Redux Toolkit with async thunks |
| **HTTP Client** | Axios |
| **UI Components** | Lucide React (icons) |
| **Notifications** | React Hot Toast |
| **Containerization** | Docker & Docker Compose |

---

## 📁 Project Structure

```
Spendwisee/
├── backend/
│   ├── src/
│   │   ├── index.ts                           # Main server entry point
│   │   ├── config/
│   │   │   └── passport.ts                    # Passport authentication config
│   │   ├── controllers/
│   │   │   ├── auth_controllers.ts            # Auth logic
│   │   │   ├── income_controllers.ts          # Income & Income Goal handling
│   │   │   ├── expense_controllers.ts         # Expense & Budget handling
│   │   │   └── goal_controllers.ts            # Goal management
│   │   ├── routes/
│   │   │   ├── auth_route.ts                  # Auth endpoints
│   │   │   ├── income_route.ts                # Income endpoints
│   │   │   ├── expense_route.ts               # Expense endpoints
│   │   │   └── goal_route.ts                  # Goal endpoints
│   │   ├── middleware/
│   │   │   └── auth_middleware.ts             # Authentication middleware
│   │   ├── lib/
│   │   │   └── prisma.ts                      # Prisma client instance
│   │   ├── types/
│   │   │   └── type.ts                        # TypeScript type definitions
│   │   └── utils/
│   │       ├── catagorywisedata.ts            # Category-wise data aggregation
│   │       └── cheakcatgory.ts                # Category validation utilities
│   ├── prisma/
│   │   ├── schema.prisma                      # Database schema
│   │   └── migrations/                        # Database migrations
│   ├── generated/
│   │   └── prisma/                            # Auto-generated Prisma client
│   ├── docker-compose.yml                     # PostgreSQL + Redis services
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── main.tsx                           # React entry point
│   │   ├── App.tsx                            # Main app component
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx             # Route protection wrapper
│   │   │   └── TopNavigation.tsx              # Navigation header
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx                  # Login page
│   │   │   ├── SignupPage.tsx                 # Registration page
│   │   │   ├── HomePage.tsx                   # Dashboard home
│   │   │   ├── AnalyticsPage.tsx              # Analytics & insights
│   │   │   ├── BudgetPage.tsx                 # Budget overview
│   │   │   ├── GoalsPage.tsx                  # Income goals management
│   │   │   ├── ExpenseBudgetPage.tsx          # Expense budget management
│   │   │   ├── IncomeFormPage.tsx             # Add/edit income
│   │   │   ├── ExpenseFormPage.tsx            # Add/edit expense
│   │   │   ├── IncomeGoalPage.tsx             # Add/edit income goal
│   │   │   └── ProfilePage.tsx                # User profile
│   │   ├── store/
│   │   │   ├── store.ts                       # Redux store configuration
│   │   │   ├── hooks.ts                       # Redux typed hooks
│   │   │   ├── api.ts                         # API configuration
│   │   │   └── slices/                        # Redux slices (auth, income, expense, goals, etc.)
│   │   ├── hooks/                             # Custom React hooks
│   │   ├── assets/                            # Static assets
│   │   ├── App.css
│   │   └── index.css                          # Global styles
│   ├── public/                                # Static files
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── tsconfig.json
│   ├── package.json
│   ├── eslint.config.js
│   └── .env.example
└── LICENSE
└── README.md
```

---

## 🗄️ Database Models

### User
- **id** (Int, Primary Key) - Unique user identifier
- **email** (String, Unique) - User email address
- **name** (String) - Full name
- **googleId** (String, Unique) - Google OAuth ID
- **password** (String) - Bcrypt hashed password
- **Relations**: Incomes, Expenses, IncomeGoals, ExpenseBudgets, Goals

### Income
- **id** (Int, Primary Key)
- **amount** (Int) - Income amount
- **category** (IncomeCategory) - SALARY | FREELANCE | BUSINESS | INVESTMENT | GIFT | OTHER
- **note** (String) - Optional description
- **date** (DateTime) - Income date
- **userId** (Int, Foreign Key) - Associated user
- **Indexes**: [userId, date], [userId, category, isActive]

### Expense
- **id** (Int, Primary Key)
- **amount** (Int) - Expense amount
- **category** (ExpenseCategory) - FOOD | TRANSPORT | RENT | SHOPPING | ENTERTAINMENT | BILLS | OTHER
- **note** (String) - Optional description
- **date** (DateTime) - Expense date
- **userId** (Int, Foreign Key) - Associated user
- **Indexes**: [userId, date]

### IncomeGoal
- **id** (Int, Primary Key)
- **category** (IncomeCategory) - Income category target
- **amount** (Int) - Target income amount
- **fulfilledAmount** (Int) - Current progress toward goal
- **type** (BudgetType) - WEEKLY | MONTHLY | YEARLY
- **periodStart** (DateTime) - Goal period start
- **periodEnd** (DateTime) - Goal period end
- **isActive** (Boolean) - Goal status
- **userId** (Int, Foreign Key) - Associated user

### ExpenseBudget
- **id** (Int, Primary Key)
- **category** (ExpenseCategory) - Budget category
- **limit** (Int) - Spending limit
- **spent** (Int) - Current spending
- **type** (BudgetType) - WEEKLY | MONTHLY | YEARLY
- **periodStart** (DateTime) - Budget period start
- **periodEnd** (DateTime) - Budget period end
- **isActive** (Boolean) - Budget status
- **userId** (Int, Foreign Key) - Associated user

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register              - User registration
POST   /login                 - User login
POST   /logout                - User logout
GET    /user                  - Get current user profile
GET    /google                - Google OAuth initiation
GET    /google/callback       - Google OAuth callback
```

### Income Routes (`/api/income`)
```
GET    /                      - Get all user incomes
POST   /                      - Add new income entry
PUT    /:id                   - Update income entry
DELETE /:id                   - Delete income entry
GET    /category              - Get category-wise income totals
```

### Expense Routes (`/api/expense`)
```
GET    /                      - Get all user expenses
POST   /                      - Add new expense entry
PUT    /:id                   - Update expense entry
DELETE /:id                   - Delete expense entry
GET    /category              - Get category-wise expense totals
```

### Goal Routes (`/api/goals`)
```
GET    /income                - Get all income goals
POST   /income                - Create income goal
PUT    /income/:id            - Update income goal
DELETE /income/:id            - Delete income goal

GET    /expense               - Get all expense budgets
POST   /expense               - Create expense budget
PUT    /expense/:id           - Update expense budget
DELETE /expense/:id           - Delete expense budget
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Docker & Docker Compose
- PostgreSQL (via Docker) or local installation
- Redis (via Docker) or local installation

### Clone Repository
```bash
git clone https://github.com/yourusername/Spendwisee.git
cd Spendwisee
```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment files:**
   ```bash
   cp .env.example .env
   ```

4. **Start PostgreSQL and Redis using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

5. **Set up the database:**
   ```bash
   npx prisma migrate dev --name init
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment files:**
   ```bash
   cp .env.example .env
   ```

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/spendwise

# Redis
REDIS_URL=redis://localhost:6379

# Session
SESSION_SECRET=your_secret_key_here

# Frontend
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

---

## ▶️ Running the Application

### Start Backend Development Server
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:3000`

### Start Frontend Development Server
```bash
cd Frontend
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
cd Frontend
npm run build
npm run preview
```

### Docker Services

**Start services:**
```bash
cd backend
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

---

## 🔧 Development Workflow

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Prisma Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Adding New Features

1. **Define database schema** in `backend/prisma/schema.prisma`
2. **Create database migration** - `npx prisma migrate dev --name feature_name`
3. **Create controllers** in `backend/src/controllers/`
4. **Create routes** in `backend/src/routes/`
5. **Add Redux slices** in `Frontend/src/store/slices/`
6. **Create pages/components** in `Frontend/src/pages/` or `Frontend/src/components/`
7. **Update API configuration** in `Frontend/src/store/api.ts`

---

## 📝 Database Schema

The database uses PostgreSQL with Prisma ORM. Key enums:
- **IncomeCategory**: SALARY, FREELANCE, BUSINESS, INVESTMENT, GIFT, OTHER
- **ExpenseCategory**: FOOD, TRANSPORT, RENT, SHOPPING, ENTERTAINMENT, BILLS, OTHER
- **BudgetType**: WEEKLY, MONTHLY, YEARLY

All models include timestamps (createdAt, updatedAt) and proper cascading delete relationships.

---

## 🔍 Key Features Implementation

- **Category-wise Analytics**: Automatic aggregation of income/expense by category
- **Goal Tracking**: Track progress against income goals and expense budgets
- **Time-based Budgets**: Support for weekly, monthly, and yearly financial planning
- **Secure Session Management**: Redis-backed sessions for scalability
- **Type Safety**: Full TypeScript support across frontend and backend
- **Protected Routes**: Automatic redirects for unauthenticated users
- **Responsive UI**: Mobile-friendly interface with Tailwind CSS

---

## 📦 Dependencies

See `backend/package.json` and `Frontend/package.json` for complete dependency lists.

### Critical Dependencies
- **Backend**: Express, Prisma, Passport, Redis, TypeScript
- **Frontend**: React, Redux Toolkit, React Router, Tailwind CSS, Vite

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 Future Enhancements

- Real-time notifications for budget alerts
- Export financial reports (PDF/CSV)
- Multi-currency support
- Recurring income/expense automation
- Bill reminders and scheduling
- Advanced filtering and search
- Mobile app (React Native)
- Dark mode toggle
- Data visualization dashboard improvements

---

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and ensure TypeScript compilation succeeds before submitting pull requests.

---

**Last Updated**: April 2026
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

### Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (via Docker or local installation)
- **Docker & Docker Compose** (for database)
- **npm** or **yarn** package manager

### 1) Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 2) Start Database

```bash
cd backend
docker compose up -d
```

Verify PostgreSQL is running:
```bash
docker ps
```

### 3) Configure Backend Environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/spendwise"
SESSION_SECRET="your-session-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT="3000"
```

**Important**: Replace placeholder values with your actual credentials.

### 4) Configure Frontend Environment (Optional)

Create `Frontend/.env` if needed:
```env
VITE_API_URL="http://localhost:3000"
```

### 5) Run Database Migrations

```bash
cd backend
npx prisma migrate dev
```

### 6) Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

Check backend health:
```bash
curl http://localhost:3000/health
```

### 7) Start Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

The app will auto-open in your browser. If not, navigate to `http://localhost:5173`.

---

## Deployment

### Docker Deployment (Recommended)

1. Build Docker images:
```bash
docker build -t spendwise-backend ./backend
docker build -t spendwise-frontend ./Frontend
```

2. Update `docker-compose.yml` with production settings and run:
```bash
docker compose -f docker-compose.yml up -d
```

### Production Checklist

- [ ] Use strong `SESSION_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set `NODE_ENV="production"`
- [ ] Use PostgreSQL managed service (AWS RDS, Google Cloud SQL, etc.)
- [ ] Configure CORS properly for your domain
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookies: `SESSION_COOKIE_SECURE=true`
- [ ] Configure proper database backups
- [ ] Set up monitoring and logging
- [ ] Use environment variables for all secrets
- [ ] Test authentication flows in staging before production

---

## Troubleshooting & Best Practices

### Common Issues

#### 1. **Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: 
- Ensure Docker is running: `docker ps`
- Verify PostgreSQL container is up: `docker compose ps`
- Check `DATABASE_URL` in `.env` matches your setup
- Restart containers: `docker compose down && docker compose up -d`

#### 2. **Session/Auth Not Working**
```
401 Unauthorized or session lost after refresh
```
**Solution**:
- Clear browser cookies: DevTools → Application → Cookies → Clear all for localhost
- Check browser allows third-party cookies
- Verify `FRONTEND_URL` in backend `.env` matches actual frontend URL
- Ensure cookies are sent with requests: `credentials: 'include'`
- Check `express-session` configuration

#### 3. **Google OAuth Not Working**
**Solution**:
- Verify Google OAuth credentials are valid and enabled
- Ensure redirect URI matches: `http://localhost:3000/auth/google/callback`
- For production, add production URL to Google Console
- Check browser console for redirect errors

#### 4. **Prisma Migration Issues**
```
Error: P3014 Prisma Migrate could not find migrations
```
**Solution**:
```bash
# Reset database (⚠️ destroys all data)
cd backend
npx prisma migrate reset

# Or manually run migrations
npx prisma migrate deploy
```

#### 5. **Port Already in Use**
**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                   # macOS/Linux

# Change port in code or kill process
```

#### 6. **Frontend Build Errors**
**Solution**:
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Best Practices

**Security**:
- Never commit `.env` files to git (use `.env.example`)
- Rotate `SESSION_SECRET` regularly in production
- Use HTTPS in production
- Validate all user inputs on backend
- Implement rate limiting for auth endpoints
- Use CSRF tokens for state-changing operations

**Performance**:
- Implement pagination for large datasets (income/expense lists)
- Add database indexes for frequently queried fields
- Cache category aggregations if queried frequently
- Use lazy loading for dashboard charts
- Monitor API response times

**Development**:
- Always test auth flows (register, login, logout, Google OAuth)
- Verify certificate/budget calculations with edge cases
- Test goal/budget transitions (weekly→monthly, etc.)
- Use TypeScript strict mode
- Add request validation with zod or joi
- Document new API endpoints

**Database**:
- Keep migrations organized by date/feature
- Test migrations on staging before production
- Backup database regularly
- Monitor query performance (use `EXPLAIN ANALYZE`)
- Archive old transaction data periodically

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
- **Analytics**: Modernized, dynamic dashboard presenting key financial health KPIs (spend ratio, transaction volume) and colorful trend charts/donut breakpoints.
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

## Important Notes

### Authentication
- Auth depends on secure HTTP-only cookies + `credentials: 'include'` in fetch requests
- Session cookie key is `connect.sid`
- Sessions expire after: check `express-session` configuration
- Google OAuth requires valid credentials in `.env`

### Goals & Budgets
- Calculated on **calendar basis**:
  - Week: Monday → Sunday
  - Month: 1st → last day of month
  - Year: Jan 1 → Dec 31
- Completion percentages cap at **100%** (exceeding shows 100%)
- Reset happens automatically at period boundaries
- Goals/budgets created mid-period calculate prorated amounts

### Data Handling
- Income/expense entries are immutable after creation (delete + recreate to modify)
- Categories are fixed enums (add new categories requires schema migration)
- Timestamps are stored in UTC
- All monetary values are stored as DECIMAL for precision

### API Rate Limiting
- Currently no rate limiting (recommended to add before production)
- Consider implementing: 100 requests/minute for auth, 500 for other endpoints

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support & Contact

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues first
- Include steps to reproduce bugs
- Provide error logs and environment details
