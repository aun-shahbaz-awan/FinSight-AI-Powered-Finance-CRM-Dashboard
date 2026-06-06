# FinSight AI API

The FinSight AI backend is a NestJS application providing versioned REST
endpoints, role-based authorization, Prisma database access, file uploads,
real-time Socket.IO notifications, background queue integration, and AI
workflows.

For complete installation, environment, database, security, and deployment
instructions, see the [root documentation](../../README.md).

## Development

From the repository root:

```bash
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm --filter api start:dev
```

The API listens on `http://localhost:4000` by default and applies the
`/api/v1` prefix to REST routes.

## Main Modules

- Authentication and role-based access
- User and client management
- KYC document processing
- Transaction lifecycle management
- Support tickets and messages
- Personal and public notifications
- Socket.IO real-time events
- AI-assisted analysis and responses
- Audit logging

## Commands

```bash
pnpm --filter api start:dev
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api test:cov
```

The API reads shared configuration from the repository root `.env`. Never
commit secrets or customer documents.
