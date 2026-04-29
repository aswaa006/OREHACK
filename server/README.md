# Backend API (Express + PostgreSQL)

This backend module is designed to map frontend payloads to the provided schema without changing frontend field names.

## Run

1. Copy `.env.example` to `.env` and set values.
2. Start in dev mode:

```bash
npm run server:dev
```

API base URL: `http://localhost:4000/api`

## Endpoints Implemented

- `POST /api/auth/team/login`
- `POST /api/auth/admin/login`
- `POST /api/problems/select`
- `POST /api/submissions`
- `POST /api/evaluations`
- `POST /api/jury/scores`
- `POST /api/results/compute/:hackathonSlug`
- `GET /api/health`

## Stage Guards

- Team login checks `hackathons.login_enabled`
- Problem selection checks `hackathons.stage1_active`
- Submission checks `hackathons.stage4_active`
- Evaluation checks `hackathons.stage4_active`
- Jury scores and final compute check `hackathons.stage5_active`

## Mapping Notes

- frontend `teamId` / `teamID` / `TeamID` -> `teams.team_id`
- frontend `repoLink` / `repoUrl` / `Repo_URL` -> `submissions.repository_url`
- frontend `problemId` -> `problems.id`

Mapping logic lives in `server/src/mappers/request-mappers.ts`.

## Response Shape

Error responses are always:

```json
{
  "success": false,
  "message": "Human readable message"
}
```

Success responses are:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Important

Routes are ready, but final route names and payload schemas should be updated to your exact frontend API contract once provided.
