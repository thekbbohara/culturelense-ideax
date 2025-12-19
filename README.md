# CultureLense Monorepo

Welcome to CultureLense, a platform for discovering cultural entities.

## Project Structure

- **apps/web**: Next.js 14 web application (PWA enabled) containing the Database Schema and logic.
- **packages/shared**: Shared utilities and types.
- **packages/ui**: Shared React UI component library.
- **services/api**: FastAPI Python backend service.

## Prerequisites

- **Node.js**: v18+
- **mpm**: v10+ (managed via package.json)
- **Python**: 3.10+
- **Poetry**: Python dependency manager

## Getting Started

### 1. Install Dependencies

**Frontend & Shared Packages:**

```bash
npm install
```

**Backend (Python):**
Navigate to the API service directory and install with Poetry.

```bash
cd services/api
poetry install
```

### 2. Environment Variables

Create `.env` files in `apps/web` and `services/api` based on any examples provided (or configure as needed for your database/services).

### 3. Running the Project

**Frontend (Web App):**
To run the Next.js app in development mode:

```bash
# From root
npm run web
```

Access the web app at [http://localhost:3000](http://localhost:3000).

### 4. Database Management

You can run database commands directly from the root:

```bash
# Push schema changes to Supabase
npm run db:push

# Generate migration files
npm run db:generate

# Seed the database
npm run db:seed
```

**Backend (API Service):**

```bash
cd services/api
poetry run uvicorn app.main:app --reload
```

Access the API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

## Building PWA

To build the web application for production (including PWA asset generation):

```bash
cd apps/web
npm run build
```

## Tools

- **TurboRepo**: Used for monorepo task management.
- **Drizzle ORM**: Database interactions.
- **TailwindCSS**: Styling.
- **Next-PWA**: Progressive Web App capabilities.
