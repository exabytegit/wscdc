import { MODALIDADES, TIPOS_COMPROBANTE, TIPOS_DOCUMENTO } from './catalogos.js';

const digits = (value) => String(value || '').replace(/[-\s]/g, '');

function isValidYyyymmdd(value) {
  if (!/^\d{8}$/.test(String(value || ''))) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

export function validateConstatarForm(payload) {
  return Object.values(getConstatarFieldErrors(payload)).flat();
}

export function getConstatarFieldErrors(payload) {
  const fieldErrors = {};
  const push = (field, message) => {
    fieldErrors[field] ||= [];
    fieldErrors[field].push(message);
  };

  if (!MODALIDADES.some((item) => item.value === payload.cbteModo)) push('cbteModo', 'Seleccione una modalidad valida.');
  if (!/^\d{11}$/.test(digits(payload.cuitEmisor))) push('cuitEmisor', 'CUIT emisor debe tener 11 digitos.');
  if (!/^\d{14}$/.test(digits(payload.codAutorizacion))) push('codAutorizacion', 'Codigo de autorizacion debe tener 14 digitos.');
  if (!isValidYyyymmdd(payload.cbteFch)) push('cbteFch', 'Fecha debe tener formato AAAAMMDD valido.');
  if (!TIPOS_COMPROBANTE.some((item) => item.value === String(payload.cbteTipo))) push('cbteTipo', 'Seleccione un tipo de comprobante valido.');
  if (!isPositiveInteger(payload.ptoVta)) push('ptoVta', 'Punto de venta debe ser un entero positivo.');
  if (!isPositiveInteger(payload.cbteNro)) push('cbteNro', 'Numero de comprobante debe ser un entero positivo.');
  if (!/^\d{1,13}([.,]\d{1,2})?$/.test(String(payload.impTotal || '')) || Number(String(payload.impTotal).replace(',', '.')) <= 0) {
    push('impTotal', 'Importe total debe ser positivo y tener hasta 2 decimales.');
  }

  if ((payload.docTipoReceptor && !payload.docNroReceptor) || (!payload.docTipoReceptor && payload.docNroReceptor)) {
    push('docTipoReceptor', 'Tipo y numero de documento deben informarse juntos.');
    push('docNroReceptor', 'Tipo y numero de documento deben informarse juntos.');
  }

  if (payload.docTipoReceptor && !TIPOS_DOCUMENTO.some((item) => item.value === String(payload.docTipoReceptor))) {
    push('docTipoReceptor', 'Seleccione un tipo de documento valido.');
  }
  if (payload.docNroReceptor && !/^\d{1,11}$/.test(digits(payload.docNroReceptor))) {
    push('docNroReceptor', 'Numero de documento receptor debe tener hasta 11 digitos.');
  }

  return fieldErrors;
}

export function normalizeConstatarPayload(payload) {
  return {
    cbteModo: String(payload.cbteModo || '').trim().toUpperCase(),
    cuitEmisor: digits(payload.cuitEmisor),
    ptoVta: Number(payload.ptoVta),
    cbteTipo: Number(payload.cbteTipo),
    cbteNro: Number(payload.cbteNro),
    cbteFch: String(payload.cbteFch || '').trim(),
    impTotal: Number(String(payload.impTotal || '').replace(',', '.')),
    codAutorizacion: digits(payload.codAutorizacion),
    docTipoReceptor: String(payload.docTipoReceptor || '').trim(),
    docNroReceptor: digits(payload.docNroReceptor),
  };
}
