# Base Frontend

Next.js 16 + React 19 + Tailwind CSS v4 starter with shared UI kit and React Query.

## Setup

```bash
cp .env.example .env.local
npm install
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:5000/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL (default: `http://localhost:5000`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run check-types` | TypeScript type check |
| `npm run lint` | ESLint |

## Project Layout

```
src/
├── app/                # Next.js routes (thin re-exports)
├── common/             # axios, socket, API types
├── modules/example/    # Example feature module
└── shared/             # UI components, hooks, utils
```

See [Frontend rules](../instructions/rules/FRONTEND_RULES.md) for conventions.
