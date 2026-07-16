import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { routes } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

export function createApp() {
  const app = express();

  // cross-origin so the SPA (:3000) can load images served by the API (:3333)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  if (env.NODE_ENV === 'development') app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  // Locally uploaded product images (fallback when Cloudinary is not configured)
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', immutable: true }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
