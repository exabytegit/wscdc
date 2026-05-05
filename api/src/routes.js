import { Router } from 'express';
import { config } from './config.js';
import { getWsapocClient } from './services/wsapoc.js';
import { paginate, validateCuit, validateDateRange } from './validators.js';

function resolveHealthStatus({ appserver, dbserver, authserver }) {
  if (appserver !== 'OK' || dbserver !== 'OK') return 'unavailable';
  if (authserver !== 'OK') return 'degraded';
  return 'operational';
}

export function createRoutes(deps = {}) {
  const router = Router();
  const wsapoc = deps.wsapocClient || getWsapocClient();

  router.get('/health', async (req, res) => {
    try {
      const dummy = await wsapoc.dummy();
      res.json({
        arcaEnv: config.ARCA_ENV,
        service: config.ARCA_SERVICE,
        status: resolveHealthStatus(dummy),
        appserver: dummy.appserver,
        dbserver: dummy.dbserver,
        authserver: dummy.authserver,
      });
    } catch (error) {
      const statusCode = error.status || 503;
      const body = {
        arcaEnv: config.ARCA_ENV,
        service: config.ARCA_SERVICE,
        status: 'unavailable',
        appserver: 'NO',
        dbserver: 'NO',
        authserver: 'NO',
        codigo: error.codigo ?? null,
        descripcion: error.descripcion || error.message || 'No se pudo consultar el estado de WSAPOC',
        scenario: error.scenario || 'HEALTH_UNAVAILABLE',
        requestId: req.id,
      };

      req.log?.error({ err: error, status: statusCode, scenario: body.scenario }, body.descripcion);
      res.status(statusCode).json(body);
    }
  });

  router.get('/consulta/cuit/:cuit', async (req, res, next) => {
    try {
      const cuit = validateCuit(req.params.cuit);
      res.json(await wsapoc.getPublicacionApoc(cuit));
    } catch (error) {
      next(error);
    }
  });

  router.get('/consulta/rango', async (req, res, next) => {
    try {
      const { desde, hasta, page, pageSize } = validateDateRange(req.query);
      const response = await wsapoc.getAllByPublicacion(desde, hasta);
      const pageData = paginate(response.items, page, pageSize);
      res.json({
        codigo: response.codigo,
        descripcion: response.descripcion,
        ...pageData,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
