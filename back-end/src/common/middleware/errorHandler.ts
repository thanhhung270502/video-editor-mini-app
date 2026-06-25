import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

interface LegacyAppError extends Error {
  statusCode?: number;
  status?: number;
}

export const errorHandler = (
  err: LegacyAppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const status = err instanceof AppError ? err.statusCode : (err.statusCode ?? err.status ?? 500);
  const message = err.message ?? 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
