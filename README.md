# Base Project

Reusable full-stack starter template. Clone this repo to start new projects without rebuilding infrastructure from scratch.

## Structure

```
base-project/
├── front-end/          # Next.js 16 + React 19 + Tailwind v4
├── back-end/           # Express + TypeScript + Firebase + Socket.io
├── instructions/       # Architecture conventions
└── design.md           # Product design reference
```

## Quick Start

### Backend

```bash
cd back-end
cp .env.example .env
# Fill in Firebase credentials
npm install
npm run dev
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

### Frontend

```bash
cd front-end
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`. Default route redirects to `/dashboard`.

## Conventions

- [Backend rules](instructions/rules/BACKEND_RULES.md)
- [Frontend rules](instructions/rules/FRONTEND_RULES.md)

## Adding Features

1. Create a new module under `back-end/src/modules/<feature>/` following the route → controller → service pattern
2. Mount the router in `back-end/src/app.ts`
3. Create a matching module under `front-end/src/modules/<feature>/`
4. Add a thin route in `front-end/src/app/` that re-exports the module page

See the `example` module in both front-end and back-end for reference.
