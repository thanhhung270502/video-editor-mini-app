import { Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

export const getValidationMessage = (error: { details: { message: string }[] }): string =>
  error.details[0]?.message ?? 'Validation failed';

export const handleControllerError = (err: unknown, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  next(err);
};
