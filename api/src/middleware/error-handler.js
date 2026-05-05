import { ApiError } from '../errors.js';

export function notFound(req, _res, next) {
  next(new ApiError({ status: 404, descripcion: `Ruta no encontrada: ${req.method} ${req.originalUrl}`, scenario: 'NOT_FOUND' }));
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const body = {
    codigo: err.codigo ?? null,
    descripcion: err.descripcion || err.message || 'Error inesperado',
    scenario: err.scenario || 'UNKNOWN',
    requestId: req.id,
  };

  req.log?.error({ err, status, scenario: body.scenario }, body.descripcion);
  res.status(status).json(body);
}
