# CultureLense Monorepo

## Structure

```
/culturelense
├── apps/
│   ├── web/                 # Next.js + PWA frontend
│   └── admin/               # Admin dashboard
├── services/
│   ├── api/                 # FastAPI backend
│   ├── ai/                  # AI model inference
│   └── workers/             # background jobs (optional)
├── packages/
│   ├── db/                  # DB layer, migrations, shared schemas
│   ├── shared/              # Shared TS/Python types, utils
│   └── ui/                  # Reusable React/Tailwind components
├── scripts/                 # Dev scripts, migration helpers
├── tests/                   # Unit/E2E tests
```

## Setup

1.  **Frontend**: `npm install` in root.
2.  **Backend**: `poetry install` (or pip install from pyproject.toml).
3.  **Environment**: See `.env.example` in each service.

## Development

- `npm run dev`: Start frontend apps
- `uvicorn services.api.app.main:app --reload`: Start API
