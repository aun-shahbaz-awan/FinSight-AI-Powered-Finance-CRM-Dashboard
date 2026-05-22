# Finsight AI

Finsight AI is a pnpm monorepo for a finance-focused AI application. It currently contains a NestJS API, a Next.js web app, and a shared Prisma database package backed by PostgreSQL and Redis.

## Project Structure

```text
finsight-ai/
├── apps/
│   ├── api/              # NestJS backend API
│   └── web/              # Next.js frontend app
├── packages/
│   └── database/         # Prisma schema, migrations, and database scripts
├── docker-compose.yml    # Local PostgreSQL and Redis services
├── package.json          # Root workspace scripts
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

## Tech Stack

- **Package manager:** pnpm
- **Backend:** NestJS
- **Frontend:** Next.js, React, Tailwind CSS, shadcn-style UI components
- **Database:** PostgreSQL with Prisma
- **Queue/cache:** Redis, BullMQ
- **Auth foundation:** Prisma user and refresh token models

## Prerequisites

- Node.js
- pnpm
- Docker and Docker Compose

## Environment

Create a root `.env` file for values shared by the apps. The API loads environment variables from the root `.env` and from its local `.env` file.

```env
PORT=4000
API_URL=http://localhost:4000
DATABASE_URL=postgresql://finsight:finsight_password@localhost:5432/finsight_ai
REDIS_URL=redis://localhost:6379
```

The database package can also use `packages/database/.env` for Prisma-specific configuration.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start local infrastructure:

```bash
docker compose up -d
```

Generate the Prisma client:

```bash
pnpm db:generate
```

Run database migrations:

```bash
pnpm db:migrate
```

Start all workspace apps in development mode:

```bash
pnpm dev
```

By default, the API listens on port `4000`. The Next.js app uses the port assigned by `next dev`, usually `3000`.

## Useful Scripts

Run from the repository root:

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all workspace packages/apps
pnpm lint         # Run lint scripts across the workspace
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run Prisma migrations
pnpm db:studio    # Open Prisma Studio
```

Run a single app:

```bash
pnpm --filter api start:dev
pnpm --filter web dev
```

## Database

Local PostgreSQL and Redis are defined in `docker-compose.yml`.

PostgreSQL defaults:

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `finsight_ai`
- **User:** `finsight`
- **Password:** `finsight_password`

Redis defaults:

- **Host:** `localhost`
- **Port:** `6379`

The Prisma schema lives at `packages/database/prisma/schema.prisma`.

## Development Notes

- Keep shared database changes in `packages/database`.
- Add backend modules under `apps/api/src`.
- Add frontend routes and components under `apps/web`.
- Run migrations whenever the Prisma schema changes.
