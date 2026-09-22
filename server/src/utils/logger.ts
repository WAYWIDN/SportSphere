import morgan from 'morgan';
import { Request } from 'express';

morgan.token('body', (req: Request) => JSON.stringify(req.body));

export const morganLogger = morgan(
  ':method :url :status :response-time ms :body ',
);
