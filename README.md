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
