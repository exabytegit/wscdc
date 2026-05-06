import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { config } from './config.js';
import { logger } from './logger.js';
import { requestId } from './middleware/request-id.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { createRoutes } from './routes.js';

function resolveCorsOrigin(origin, callback) {
  if (config.CORS_ORIGIN === '*') {
    callback(null, true);
    return;
  }

  const allowedOrigins = new Set(
    config.CORS_ORIGIN.split(',').map((item) => item.trim()).filter(Boolean),
  );
  allowedOrigins.add('http://127.0.0.1:5500');

  if (!origin || allowedOrigins.has(origin)) {
    callback(null, true);
    return;
  }

  callback(null, false);
}

export function createApp(deps = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigin }));
  app.use(express.json({ limit: '256kb' }));
  app.use(requestId);
  app.use(pinoHttp({ logger, genReqId: (req) => req.id }));

  app.use(config.API_BASE_PATH, createRoutes(deps));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
