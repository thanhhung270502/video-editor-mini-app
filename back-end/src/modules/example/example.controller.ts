import { Request, Response } from 'express';

import { getExampleMessage } from './example.service';

export const getExample = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: getExampleMessage(),
  });
};
