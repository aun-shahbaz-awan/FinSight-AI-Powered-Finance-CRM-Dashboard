# FinSight AI Web

The FinSight AI frontend is a Next.js App Router application for authentication,
dashboard analytics, clients, KYC reviews, transactions, support tickets,
notifications, and AI-assisted operations.

For complete installation, environment, architecture, security, and deployment
instructions, see the [root documentation](../../README.md).

## Environment

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

These values are exposed to the browser and must never contain secrets.

## Development

From the repository root:

```bash
pnpm install
pnpm --filter web dev
```

Open `http://localhost:3000`.

## Commands

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web lint
```
