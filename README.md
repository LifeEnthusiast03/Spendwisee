# Spendwise

A full-stack expense tracker application with local and Google OAuth authentication.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, React Router v7, Axios, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, Passport.js |
| Database | PostgreSQL (via Docker) |
| ORM | Prisma |
| Auth | Passport Local + Passport Google OAuth 2.0, express-session |

---

## Project Structure

```
Spendwisee/
├── backend/
│   ├── src/
│   │   ├── index.ts               # Express app entry point
│   │   ├── config/
│   │   │   └── passport.ts        # Local & Google Passport strategies
│   │   ├── routes/
│   │   │   └── auth_route.ts      # /auth/register, /auth/login, /auth/google, /dashboard
│   │   ├── middleware/
│   │   │   └── auth_middleware.ts # isAuthenticated guard
│   │   ├── lib/
│   │   │   └── prisma.ts          # Prisma client singleton
│   │   └── types/
│   │       └── type.ts            # IUser interface
│   ├── prisma/
│   │   └── schema.prisma          # User model
│   ├── docker-compose.yml         # PostgreSQL container
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── App.tsx                # Route definitions
    │   ├── pages/
    │   │   ├── LoginPage.tsx      # Login form → native POST to backend
    │   │   └── SignupPage.tsx     # Signup form → axios POST
    │   ├── App.css
    │   └── main.tsx
    └── package.json
```

---

## Database Schema

```prisma
model User {
  id       Int     @id @default(autoincrement())
  email    String  @unique
  name     String?
  googleId String? @unique
  password String?
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop

### 1. Start the database

```bash
cd backend
docker-compose up -d
```

### 2. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/spendwise"
SESSION_SECRET="your-session-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### 3. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

### 4. Start the backend

```bash
cd backend
npm run dev      # development (nodemon + ts-node)
# or
npm run build && npm start   # production
```

Backend runs on **http://localhost:3000**

### 5. Start the frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Auth Flow

### Email / Password

| Step | Description |
|------|-------------|
| Register | `POST /auth/register` — hashes password with bcrypt, stores user in DB |
| Login | Native form `POST /auth/login` — Passport Local verifies credentials, creates session, redirects to `/dashboard` |
| Failure | Redirects back to `/login?error=<reason>` — error shown on the page |

### Google OAuth

| Step | Description |
|------|-------------|
| Initiate | `GET /auth/google` — redirects to Google consent screen |
| Callback | `GET /auth/google/callback` — Passport creates or links user, creates session |
| Success | Redirects to `/dashboard` |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | Public | Register with name, email, password |
| `POST` | `/auth/login` | Public | Login with email, password |
| `GET` | `/auth/google` | Public | Start Google OAuth flow |
| `GET` | `/auth/google/callback` | Public | Google OAuth callback |
| `GET` | `/dashboard` | Protected | View logged-in user info |

---

## Scripts

### Backend

```bash
npm run dev      # Start with nodemon (ts-node)
npm run build    # Compile TypeScript
npm start        # Run compiled output
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

