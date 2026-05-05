import { ApiError } from '../../errors.js';

const MODALIDADES = new Set(['CAE', 'CAEA', 'CAI']);

function validationError(descripcion) {
  return new ApiError({ status: 400, codigo: 200, descripcion, scenario: 'VALIDATION_ERROR' });
}

function onlyDigits(value) {
  return String(value ?? '').replace(/[-\s]/g, '');
}

function isValidYyyymmdd(value) {
  const raw = String(value ?? '');
  if (!/^\d{8}$/.test(raw)) return false;
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateCuitLike(value, field) {
  const cleaned = onlyDigits(value);
  if (!/^\d{11}$/.test(cleaned)) throw validationError(`${field} debe tener 11 digitos numericos.`);
  return cleaned;
}

function validateInteger(value, field, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw validationError(`${field} debe ser un entero entre ${min} y ${max}.`);
  }
  return number;
}

function validateImporte(value) {
  const raw = String(value ?? '').replace(',', '.');
  if (!/^\d{1,13}(\.\d{1,2})?$/.test(raw)) {
    throw validationError('ImpTotal debe ser un numero positivo con hasta 13 enteros y 2 decimales.');
  }
  return Number(raw);
}

function validateOpcionales(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw validationError('Opcionales debe ser un arreglo.');
  return value.map((item) => {
    const id = String(item?.id ?? item?.Id ?? '').trim();
    const valor = String(item?.valor ?? item?.Valor ?? '').trim();
    if (!id || !valor) throw validationError('Cada opcional debe informar id y valor.');
    return { id, valor };
  });
}

export function validateConstatarPayload(input) {
  const cbteModo = String(input?.cbteModo ?? input?.CbteModo ?? '').trim().toUpperCase();
  if (!MODALIDADES.has(cbteModo)) throw validationError('CbteModo debe ser CAE, CAEA o CAI.');

  const docTipoReceptor = String(input?.docTipoReceptor ?? input?.DocTipoReceptor ?? '').trim();
  const docNroReceptor = onlyDigits(input?.docNroReceptor ?? input?.DocNroReceptor ?? '');
  if ((docTipoReceptor && !docNroReceptor) || (!docTipoReceptor && docNroReceptor)) {
    throw validationError('Si informa documento receptor, debe informar tipo y numero.');
  }

  const cbteFch = String(input?.cbteFch ?? input?.CbteFch ?? '').trim();
  if (!isValidYyyymmdd(cbteFch)) throw validationError('CbteFch debe tener formato yyyymmdd valido.');

  const codAutorizacion = onlyDigits(input?.codAutorizacion ?? input?.CodAutorizacion ?? '');
  if (!/^\d{14}$/.test(codAutorizacion)) {
    throw validationError('CodAutorizacion debe tener 14 digitos numericos.');
  }

  return {
    cbteModo,
    cuitEmisor: validateCuitLike(input?.cuitEmisor ?? input?.CuitEmisor, 'CuitEmisor'),
    ptoVta: validateInteger(input?.ptoVta ?? input?.PtoVta, 'PtoVta', 1, 99998),
    cbteTipo: validateInteger(input?.cbteTipo ?? input?.CbteTipo, 'CbteTipo', 1, 999),
    cbteNro: validateInteger(input?.cbteNro ?? input?.CbteNro, 'CbteNro', 1, 99999999),
    cbteFch,
    impTotal: validateImporte(input?.impTotal ?? input?.ImpTotal),
    codAutorizacion,
    docTipoReceptor,
    docNroReceptor,
    opcionales: validateOpcionales(input?.opcionales ?? input?.Opcionales),
  };
}

export { isValidYyyymmdd };
