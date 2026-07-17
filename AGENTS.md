# Repository Guidelines

## Project Structure & Module Organization

SpendWise has two independent Node.js packages:

- `spendfront/` is the Vite + React + TypeScript client. Pages live in `src/pages/`, reusable UI in `src/components/`, server-state hooks in `src/hooks/`, and Redux code in `src/store/`.
- `backend/` is the Express + TypeScript API. Keep routes in `src/routes/`, request logic in `src/controllers/`, shared services in `src/lib/`, `src/utils/`, and `src/email/`, and AI features in `src/finantial_agant/`.
- `backend/prisma/schema.prisma` is the database source of truth; migrations are committed under `backend/prisma/migrations/`. Do not hand-edit `backend/generated/prisma/`.

## Build, Test, and Development Commands

Run commands from the relevant package directory after `npm install`.

- `cd spendfront; npm run dev` starts the frontend dev server.
- `cd spendfront; npm run build` type-checks and produces the production client bundle.
- `cd spendfront; npm run lint` runs ESLint over TypeScript and TSX sources.
- `cd backend; npm run dev` starts the API with automatic restart.
- `cd backend; npm run build` compiles TypeScript to `backend/dist/`; `npm start` runs that output.
- From `backend/`, use `npx prisma migrate dev --name <change>` for schema changes and `npx prisma generate` after updating the schema.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow the local file style: frontend code uses single quotes and no semicolons, while backend code uses double quotes and semicolons. Use PascalCase for React components and page files (`ProfilePage.tsx`), camelCase for functions and variables, and snake_case for backend route/controller modules (for example, `income_goal_route.ts`). Prefer `import type` for type-only imports. Run relevant linting and builds before submitting.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. For each change, run the relevant build; for frontend work also run `npm run lint`. Manually exercise the affected route or API flow, including unauthenticated behavior for protected features. When adding tests, place them next to the feature or in a clearly named test directory and use `*.test.ts`/`*.test.tsx` naming.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style subjects, such as `feat(profile): redesign financial snapshot section` and `fix(sidebar): restore expand button`. Use `type(scope): concise imperative summary`. Keep commits focused. Pull requests should explain the user-visible change, list validation, link issues when available, and include screenshots for UI changes. Call out migrations, new environment variables, or configuration changes; never commit `.env` secrets.
