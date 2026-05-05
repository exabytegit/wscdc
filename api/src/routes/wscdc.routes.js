import { Router } from 'express';
import { config } from '../config.js';
import { getCatalog } from '../services/wscdc/wscdc.catalogs.js';

function withMeta(body) {
  return {
    ok: body.errors ? body.errors.length === 0 : true,
    service: config.ARCA_SERVICE,
    arcaEnv: config.ARCA_ENV,
    ...body,
  };
}

export function createWscdcRoutes({ wscdcClient }) {
  const router = Router();

  router.get('/dummy', async (_req, res, next) => {
    try {
      res.json(withMeta(await wscdcClient.dummy()));
    } catch (error) {
      next(error);
    }
  });

  for (const name of ['modalidades', 'comprobantes', 'documentos', 'opcionales']) {
    router.get(`/catalogos/${name}`, async (req, res, next) => {
      try {
        const catalog = await getCatalog(wscdcClient, name, { refresh: req.query.refresh === '1' });
        res.json(withMeta(catalog));
      } catch (error) {
        next(error);
      }
    });
  }

  router.post('/constatar', async (req, res, next) => {
    try {
      res.json(withMeta(await wscdcClient.constatar(req.body)));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
