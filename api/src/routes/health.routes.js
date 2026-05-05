import { Router } from 'express';
import { config } from '../config.js';

function resolveHealthStatus({ appserver, dbserver, authserver }) {
  if (appserver !== 'OK' || dbserver !== 'OK') return 'unavailable';
  if (authserver !== 'OK') return 'degraded';
  return 'operational';
}

export function createHealthRoutes({ wscdcClient }) {
  const router = Router();

  router.get('/health', async (req, res) => {
    try {
      const dummy = await wscdcClient.dummy();
      res.json({
        ok: true,
        service: config.ARCA_SERVICE,
        arcaEnv: config.ARCA_ENV,
        status: resolveHealthStatus(dummy),
        api: 'OK',
        appserver: dummy.appserver,
        dbserver: dummy.dbserver,
        authserver: dummy.authserver,
      });
    } catch (error) {
      const statusCode = error.status || 503;
      const body = {
        ok: false,
        service: config.ARCA_SERVICE,
        arcaEnv: config.ARCA_ENV,
        status: 'unavailable',
        api: 'OK',
        appserver: 'NO',
        dbserver: 'NO',
        authserver: 'NO',
        codigo: error.codigo ?? null,
        descripcion: error.descripcion || error.message || 'No se pudo consultar el estado de WSCDC',
        scenario: error.scenario || 'HEALTH_UNAVAILABLE',
        requestId: req.id,
      };

      req.log?.error({ err: error, status: statusCode, scenario: body.scenario }, body.descripcion);
      res.status(statusCode).json(body);
    }
  });

  return router;
}
