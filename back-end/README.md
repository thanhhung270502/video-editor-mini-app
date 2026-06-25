# Base Backend

Express.js + TypeScript + Firebase Firestore + Socket.io starter.

## Setup

```bash
cp .env.example .env
npm install
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key |
| `FRONTEND_URL` | Allowed CORS origin |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm test` | Run Jest tests |
| `npm start` | Run compiled production build |

## Project Layout

```
src/
├── app.ts              # Express app factory
├── index.ts            # Server bootstrap + Socket.io
├── common/             # Shared infrastructure
└── modules/example/    # Example feature module
```

See [Backend rules](../instructions/rules/BACKEND_RULES.md) for conventions.
