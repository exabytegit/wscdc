export class ApiError extends Error {
  constructor({ status = 500, codigo = null, descripcion, scenario = 'UNKNOWN', cause = null }) {
    super(descripcion);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.descripcion = descripcion;
    this.scenario = scenario;
    this.cause = cause;
  }
}

export function mapWsCodeToError(codigo, descripcion) {
  const numeric = Number(codigo);
  if (numeric === 200) {
    return new ApiError({ status: 400, codigo: numeric, descripcion, scenario: 'VALIDATION_ERROR' });
  }
  if (numeric === 201) {
    return new ApiError({ status: 401, codigo: numeric, descripcion, scenario: 'AUTH_EXPIRED' });
  }
  if (numeric === 100 || numeric === 300) {
    return new ApiError({ status: 502, codigo: numeric, descripcion, scenario: 'SOAP_FAULT' });
  }
  return null;
}

export function normalizeExternalError(error, fallback = 'Error al consultar servicio externo') {
  if (error instanceof ApiError) return error;

  if (error?.code === 'ECONNABORTED' || error?.name === 'AbortError') {
    return new ApiError({ status: 504, descripcion: 'Timeout al consultar ARCA', scenario: 'TIMEOUT', cause: error });
  }

  if (error?.response?.status) {
    return new ApiError({
      status: 502,
      descripcion: `${fallback}: HTTP ${error.response.status}`,
      scenario: 'SOAP_FAULT',
      cause: error,
    });
  }

  return new ApiError({ status: 502, descripcion: fallback, scenario: 'NETWORK_ERROR', cause: error });
}
