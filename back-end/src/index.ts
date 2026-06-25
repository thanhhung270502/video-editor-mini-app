import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

import { validateEnv } from './common/config/env';
import { initializeFirebase } from './common/services/firebase';
import { initializeSocket } from './common/socket';
import { createApp } from './app';

validateEnv();
initializeFirebase();

const app = createApp();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

initializeSocket(io);

if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT ?? '5000', 10);
  httpServer.listen(PORT, () => {
    console.log(`\nBackend running on http://localhost:${PORT}`);
    console.log(`Socket.io enabled`);
    console.log(`Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
  });
}

export { app, httpServer };
export default app;
