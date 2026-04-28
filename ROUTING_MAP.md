# Routing Map

This project has three routing layers:

1. Frontend route (React Router)
2. Backend API route (Express)
3. Database table route (PostgreSQL/Supabase)

## Frontend -> Backend

- `src/pages/AdminAuth.tsx`
  - Calls `POST /api/auth/admin/login` via `src/lib/backend-api.ts`
- `src/pages/OriginAdmin.tsx`
  - Calls `POST /api/auth/admin/login` via `src/lib/backend-api.ts`
- `src/pages/HackathonLogin.tsx`
  - Uses Supabase direct team verification (`src/lib/team-auth.ts`)
- `src/pages/Login.tsx`
  - Uses Supabase direct team verification (`src/lib/team-auth.ts`)

## Backend API -> Database

- `POST /api/auth/admin/login`
  - Primary: `public.admins` via PostgreSQL pool (`DATABASE_URL`)
  - Fallback: `public.admins` via Supabase (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
- `POST /api/auth/team/login`
  - `public.hackathons`, `public.teams`
- `POST /api/problems/select`
  - `public.teams`, `public.problem_selections`, `public.problems`
- `POST /api/submissions`
  - `public.teams`, `public.submissions`
- `POST /api/evaluations`
  - `public.teams`, `public.submissions`, `public.evaluation_reports`
- `POST /api/jury/scores`
  - `public.teams`, `public.jury_scores`
- `POST /api/results/compute/:hackathonSlug`
  - `public.hackathons`, `public.submissions`, `public.jury_scores`, `public.final_results`

## Environment Routing

Backend server variables (`server/.env`):

- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `PORT` (optional, default `4000`)
- `SUPABASE_URL` (optional fallback for auth lookup)
- `SUPABASE_SERVICE_ROLE_KEY` (optional fallback for auth lookup)

Frontend variable (`.env`):

- `VITE_API_BASE_URL` (optional, default `http://localhost:4000/api`)

## Diagnostics

- Health: `GET /api/health`
- API catalog: `GET /api/routes`
