import { Router } from 'express';
import { createHealthRoutes } from './routes/health.routes.js';
import { createWscdcRoutes } from './routes/wscdc.routes.js';
import { getWscdcClient } from './services/wscdc/wscdc.soap.js';

export function createRoutes(deps = {}) {
  const router = Router();
  const wscdcClient = deps.wscdcClient || getWscdcClient();

  router.use(createHealthRoutes({ wscdcClient }));
  router.use('/wscdc', createWscdcRoutes({ wscdcClient }));

  return router;
}
