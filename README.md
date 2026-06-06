# FinSight AI

FinSight AI is a full-stack financial operations platform for managing clients,
KYC documents, transactions, support tickets, notifications, audit activity,
and AI-assisted workflows from one dashboard.

The project is organized as a pnpm monorepo with a Next.js frontend, a NestJS
API, a shared Prisma database package, PostgreSQL, Redis, BullMQ, and
Socket.IO-based real-time updates.

> **Project status:** Active development. Review the security and deployment
> notes before using this project in a production environment.

## Features

- Role-based authentication and authorization
- Access-token and refresh-token authentication
- Client profiles and account management
- KYC document upload, review, approval, and rejection
- Transaction creation, review, status tracking, and audit history
- Support ticket conversations and status management
- Personal and system-wide notifications
- Real-time notification delivery with Socket.IO
- AI-generated summaries, support replies, risk insights, and dashboard Q&A
- Application-level audit logging
- Responsive administrative dashboard
- Docker-based local infrastructure and production deployment

## Technology Stack

| Area | Technology |
| --- | --- |
| Monorepo | pnpm workspaces |
| Web | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI, shadcn-style components |
| State and data | Zustand, TanStack Query, Axios |
| API | NestJS 11, TypeScript |
| Database | PostgreSQL 16, Prisma 7 |
| Cache and queues | Redis 7, BullMQ |
| Real-time events | Socket.IO |
| Validation | class-validator, Zod, React Hook Form |
| AI providers | OpenAI or OpenRouter |
| Containers | Docker, Docker Compose |

## Repository Structure

```text
finsight-ai/
├── apps/
│   ├── api/                         # NestJS REST API and Socket.IO server
│   │   ├── src/modules/             # Domain modules
│   │   └── uploads/                 # Local uploaded files, ignored by Git
│   └── web/                         # Next.js dashboard
│       ├── app/                     # App Router pages and layouts
│       ├── components/              # Shared interface components
│       └── features/                # Feature-specific clients and UI
├── packages/
│   └── database/
│       ├── prisma/schema.prisma     # Database models and enums
│       ├── prisma/migrations/       # Versioned database migrations
│       └── generated/prisma/        # Generated Prisma client
├── docker-compose.yml               # Local PostgreSQL and Redis
├── docker-compose.prod.yml          # Production application stack
├── .env.example                     # Documented environment template
└── pnpm-workspace.yaml              # Workspace definition
```

## Architecture

The browser communicates with the NestJS API through versioned REST endpoints.
The API owns authentication, authorization, validation, business rules, file
uploads, AI requests, and database access. Prisma provides the shared generated
database client. Socket.IO pushes notification events to connected users.

```text
Next.js web application
        |
        | REST + credentials
        | Socket.IO
        v
NestJS API
   |          |
   |          +---- Redis / BullMQ
   |
   +--------------- PostgreSQL / Prisma
   |
   +--------------- OpenAI or OpenRouter
```

All REST routes use the `/api/v1` prefix. During local development:

- Web application: `http://localhost:3000`
- API base URL: `http://localhost:4000/api/v1`
- Uploaded files: `http://localhost:4000/uploads/...`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Roles

The database defines the following roles:

| Role | Intended access |
| --- | --- |
| `SUPER_ADMIN` | Full platform administration |
| `ADMIN` | User administration and operational management |
| `MANAGER` | Client, KYC, transaction, ticket, notification, and AI workflows |
| `ANALYST` | Restricted operational access |
| `SUPPORT` | Support-oriented access |

Authorization is enforced by guards in the API. Do not rely only on frontend
navigation or hidden controls for access control.

## Prerequisites

Install the following before running the project:

- Node.js 22 or newer
- pnpm 10 or newer
- Docker Engine with Docker Compose
- An OpenAI or OpenRouter API key to use AI features

Enable pnpm through Corepack if necessary:

```bash
corepack enable
corepack prepare pnpm@10.30.0 --activate
```

## Environment Configuration

Create the local environment files from the supplied example:

```bash
cp .env.example .env
cp .env.example packages/database/.env
```

The database package only requires `DATABASE_URL`; the additional variables in
its copied file are harmless but may be removed. Create the frontend file:

```bash
cat > apps/web/.env.local <<'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
EOF
```

Never commit `.env`, `.env.local`, `.env.production`, API keys, database
passwords, JWT secrets, exported cookies, or other credentials.

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | Runtime mode, normally `development` or `production` |
| `PORT` | No | API port; defaults to `4000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma and the API |
| `REDIS_HOST` | Yes | Redis hostname |
| `REDIS_PORT` | Yes | Redis port |
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign short-lived access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret reserved for refresh-token operations |
| `APP_URL` | Yes | Comma-separated frontend origins allowed by API CORS |
| `API_URL` | No | Public API origin for deployment configuration |
| `AI_PROVIDER` | For AI | `openai` or `openrouter`; defaults to `openai` |
| `OPENAI_API_KEY` | Conditional | Required when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | No | OpenAI model; defaults to `gpt-4.1-mini` |
| `OPENROUTER_API_KEY` | Conditional | Required when `AI_PROVIDER=openrouter` |
| `OPENROUTER_MODEL` | No | OpenRouter model; defaults to `openrouter/free` |
| `NEXT_PUBLIC_API_URL` | Yes | Browser-facing API URL including `/api/v1` |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | API origin used for uploaded file links |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Browser-facing Socket.IO server origin |
| `POSTGRES_USER` | Production | PostgreSQL user used by production Compose |
| `POSTGRES_PASSWORD` | Production | PostgreSQL password used by production Compose |
| `POSTGRES_DB` | Production | PostgreSQL database used by production Compose |

Generate strong JWT secrets instead of using the example values:

```bash
openssl rand -base64 48
```

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL and Redis

```bash
docker compose up -d
```

Check container health and logs:

```bash
docker compose ps
docker compose logs -f postgres redis
```

### 3. Generate the Prisma client

```bash
pnpm db:generate
```

### 4. Apply database migrations

```bash
pnpm db:migrate
```

`db:migrate` runs `prisma migrate dev` and is intended for development. Commit
both schema updates and generated migration SQL when changing the data model.

### 5. Start the applications

```bash
pnpm dev
```

To run each application separately:

```bash
pnpm --filter api start:dev
pnpm --filter web dev
```

Open `http://localhost:3000` after both applications have started.

## Available Scripts

Run these commands from the repository root:

| Command | Description |
| --- | --- |
| `pnpm dev` | Start all workspace development processes |
| `pnpm build` | Build all workspace applications and packages |
| `pnpm lint` | Run workspace lint scripts |
| `pnpm db:generate` | Generate the Prisma client |
| `pnpm db:migrate` | Create or apply development migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm --filter api test` | Run API unit tests |
| `pnpm --filter api test:e2e` | Run API end-to-end tests |
| `pnpm --filter api test:cov` | Run API tests with coverage |

## Database Workflow

The Prisma schema is located at
`packages/database/prisma/schema.prisma`.

After modifying it:

```bash
pnpm db:migrate
pnpm db:generate
pnpm build
```

Use a descriptive migration name when Prisma prompts for one. In automated
production environments, apply committed migrations with:

```bash
pnpm --filter @finsight/database exec prisma migrate deploy
```

Do not edit a migration after it has been applied to a shared database. Create
a follow-up migration instead.

## API Overview

The API is grouped into these domain modules:

- `auth`: registration, login, token refresh, logout, and current user
- `users`: administrative user management
- `dashboard`: operational dashboard metrics
- `clients`: client records and profile management
- `kyc`: document uploads and verification decisions
- `transactions`: transaction lifecycle and audit history
- `tickets`: support tickets and ticket messages
- `notifications`: user notifications and public announcements
- `realtime`: Socket.IO connections and event delivery
- `ai`: summaries, suggested replies, risk analysis, and dashboard questions
- `audit`: application audit events

Protected requests use a bearer access token. Refresh-token requests also rely
on an HTTP-only cookie, so browser requests must include credentials.

## AI Provider Setup

### OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

### OpenRouter

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openrouter/free
```

Only configure trusted model identifiers. AI output should be treated as
assistance, not authoritative financial, compliance, or legal advice.

## File Uploads

KYC files are stored locally under `uploads/kyc` by the API and served from the
`/uploads` path. The production Compose stack persists this directory in the
`uploads_data` volume.

For a multi-instance or serverless production deployment, replace local storage
with durable object storage and add appropriate file validation, malware
scanning, retention, and access-control policies.

## Production Deployment

Create a private `.env.production` using `.env.example` as a reference. Use
production hostnames for the public variables and Docker service names for
internal database and Redis connections:

```env
NODE_ENV=production
POSTGRES_USER=finsight
POSTGRES_PASSWORD=replace-with-a-strong-password
POSTGRES_DB=finsight_ai
DATABASE_URL=postgresql://finsight:replace-with-a-strong-password@postgres:5432/finsight_ai
REDIS_HOST=redis
REDIS_PORT=6379
APP_URL=https://app.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_SOCKET_URL=https://api.example.com
```

Build and start the stack:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Apply migrations as part of the release process:

```bash
docker compose -f docker-compose.prod.yml exec api \
  pnpm --filter @finsight/database exec prisma migrate deploy
```

Production deployments should also use TLS, a reverse proxy, secure secret
management, database backups, monitoring, centralized logs, and restricted
network access to PostgreSQL and Redis.

## Security Checklist

Before exposing an installation publicly:

- Replace all example passwords and JWT secrets.
- Keep `.env*`, cookies, logs, uploads, and credentials out of Git.
- Use HTTPS for the web application, API, and Socket.IO.
- Set exact production origins in `APP_URL`.
- Review role permissions and administrative account creation.
- Restrict upload types and sizes and scan uploaded documents.
- Protect PostgreSQL and Redis from public network access.
- Rotate any secret that may previously have been committed.
- Enable dependency scanning and automated security updates.
- Add rate limits appropriate for authentication, uploads, and AI endpoints.
- Review financial and personal-data retention requirements.

## Troubleshooting

### Prisma types do not match the schema

```bash
pnpm db:generate
pnpm --filter api build
```

### A database column or table is missing

```bash
pnpm --filter @finsight/database exec prisma migrate status
pnpm db:migrate
```

### The web application cannot reach the API

Verify `NEXT_PUBLIC_API_URL`, confirm the API is listening on port `4000`, and
ensure the web origin is included in `APP_URL`.

### Real-time notifications do not appear

Verify `NEXT_PUBLIC_SOCKET_URL`, confirm Redis and the API are running, and
inspect the browser and API logs for Socket.IO connection errors.

### Uploaded documents do not open

Verify `NEXT_PUBLIC_API_BASE_URL`, the API working directory, and the existence
and permissions of the `uploads` directory or production volume.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a focused branch from the default branch.
3. Install dependencies and configure the environment.
4. Add tests for behavior changes where practical.
5. Run `pnpm lint` and `pnpm build`.
6. Commit schema migrations with database changes.
7. Open a pull request describing the problem and solution.

Keep changes focused and never include secrets, production data, personal
information, generated cookies, or uploaded customer documents.

## License

No open-source license has been added yet. Until a license file is included,
copyright law reserves all rights to the repository owner. Add a `LICENSE` file
before publicly advertising the project as reusable open-source software.

## Disclaimer

FinSight AI is a software project and does not provide financial, investment,
legal, tax, or compliance advice. Validate all AI-generated content and
financial workflows before relying on them in real-world decisions.
