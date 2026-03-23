import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/error-handler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ ok: true, service: 'rastreamento-api' });
  });

  app.use('/api', apiRouter);
  app.use(errorHandler);

  return app;
}
