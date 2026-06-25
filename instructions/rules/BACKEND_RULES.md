# Backend Rules

Tech stack: Express.js 4, TypeScript, Firebase Admin (Firestore), Socket.io, Joi.

## Project Structure

```
back-end/src/
├── index.ts                    # bootstrap: env, Firebase, HTTP server, Socket.io
├── app.ts                      # Express middleware + route mounting
├── common/
│   ├── config/env.ts           # environment validation
│   ├── errors/app-error.ts     # typed HTTP errors
│   ├── middleware/errorHandler.ts
│   ├── services/firebase.ts      # Firebase Admin init + getDb()
│   ├── socket/index.ts         # Socket.io placeholder / shared handlers
│   ├── types/                    # ApiResponse, pagination types
│   ├── utils/                    # controller helpers, Firestore pagination
│   └── validators/               # shared Joi validators (e.g. pagination)
└── modules/
    └── <feature>/
        ├── index.ts              # export router only
        ├── <feature>.route.ts
        ├── <feature>.controller.ts
        ├── <feature>.service.ts
        ├── <feature>.model.ts
        └── <feature>.validator.ts  # optional
```

**Root `index.ts` rule**: mount module routers only — no business logic.

```ts
import exampleRouter from './modules/example';

app.use('/api/example', exampleRouter);
```

## Module Layer Responsibilities

```
HTTP Request → route → validator → controller → service → Firestore
```

| File | Responsibility |
|------|----------------|
| `*.route.ts` | Express `Router`, map paths → controller |
| `*.controller.ts` | Extract `req` data, call service, send `res` |
| `*.service.ts` | Business logic, Firestore CRUD |
| `*.model.ts` | Interfaces, enums, request/response types |
| `*.validator.ts` | Joi schemas (optional) |
| `index.ts` | Export router only |

## API Response Format

```ts
// Success
res.json({ success: true, message?: string, data?: T });

// Error
res.status(400).json({ success: false, message: 'Human-readable error' });
```

## Socket.io

Initialize shared handlers in `common/socket/index.ts` and call from `index.ts`:

```ts
import { initializeSocket } from './common/socket';
initializeSocket(io);
```

Feature-specific socket handlers can live in `modules/<feature>/<feature>.socket.ts`.

## Firestore Access

- Always use `getDb()` from `common/services/firebase.ts`
- Use `new Date()` for timestamps
- Throw `AppError` with appropriate `statusCode` for not-found/conflict cases

## Environment Variables

| Variable | Required (prod) | Purpose |
|----------|-----------------|---------|
| `PORT` | no (default 5000) | Server port |
| `NODE_ENV` | no | `development` / `production` |
| `FIREBASE_PROJECT_ID` | yes | Firestore |
| `FIREBASE_CLIENT_EMAIL` | yes | Firestore |
| `FIREBASE_PRIVATE_KEY` | yes | Firestore |
| `FRONTEND_URL` | no | CORS origin |

## Adding a New Feature Module

1. Create `modules/<feature>/` with route, controller, service, model, index
2. Mount router in `app.ts`
3. Add frontend API models in `front-end/src/common/models/<domain>/` if needed
4. Run `npm run build && npm test`

## Build & Test

```bash
cd back-end
npm run build
npm test
npm run dev
```
