import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler, notFound } from './common/middleware/errorHandler';
import exampleRouter from './modules/example';
import videoEditorRouter from './modules/video-editor';

export const createApp = (): express.Application => {
  const app = express();

  app.use(helmet());

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some((allowed) => {
          const normalizedAllowed = allowed.replace(/\/$/, '');
          return normalizedOrigin === normalizedAllowed;
        });

        if (isAllowed || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          console.warn(`[CORS] Blocked request from origin: ${origin}`);
          callback(null, false);
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', generalLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    });
  });

  app.use('/api/example', exampleRouter);
  app.use('/api/video', videoEditorRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
