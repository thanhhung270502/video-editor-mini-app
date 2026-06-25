# Frontend Rules

Tech stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query, React Hook Form + Zod.

## Project Structure

```
front-end/src/
├── app/                        # thin Next.js routes (re-export modules)
├── common/
│   ├── lib/                    # axios, socket
│   └── types/                  # APIDefinition, pagination
├── modules/
│   └── <module>/               # feature code
└── shared/
    ├── components/             # UI kit
    ├── hooks/                  # shared hooks
    ├── utils/
    └── libs/
```

## Module Structure

Every feature lives under `src/modules/<module>/`:

```
src/modules/<module>/
├── index.ts            # export hooks, layouts, pages, types ONLY
├── components/
├── hooks/
├── layouts/
└── pages/
    └── <name>.page.tsx
```

**Root `index.ts` rule**: export hooks/layouts/pages/types — never components.

## App Router Pattern

Keep Next.js routes thin — re-export from modules:

```ts
// app/dashboard/page.tsx
export { DashboardPage as default } from "@/modules/example";
```

## Data Model Layer (`common/models/<domain>/`)

```
common/models/<domain>/
├── index.ts
├── <domain>-model.ts         # TypeScript types only
└── <domain>-api-model.ts     # APIDefinition constants
```

## Shared Components

Check `src/shared/components/index.ts` before creating anything new.

| Need | Use |
|------|-----|
| Text | `<Typography variant="..." />` |
| Actions | `<Button variant="..." />` |
| Forms | `<FormField />` + react-hook-form |
| Tables | `shared/components/table/` |
| Layout | `<AppLayout />`, `<PageHeader />`, `<EmptyState />` |

## Hooks

- Client hooks start with `"use client"`
- Co-locate Zod schema + form hook when using react-hook-form
- Shared query/mutation hooks live in `shared/hooks/`

## API Client

- Use `axiosInstance` from `@/common/lib/axios`
- Use typed `APIDefinition` constants from `common/models/`
- Always use null-safe defaults: `response?.data ?? []`

## Socket.io

Use helpers from `@/common/lib/socket`:

```ts
import { connectSocket, disconnectSocket } from "@/common/lib";
```

## File Naming

| Item | Convention | Example |
|------|-----------|---------|
| Component files | `kebab-case.tsx` | `sidebar.tsx` |
| Page files | `kebab-case.page.tsx` | `dashboard.page.tsx` |
| Hook files | `use-kebab-case.ts` | `use-example-form.ts` |

## Build Check

```bash
cd front-end
npm run check-types
npm run build
```
