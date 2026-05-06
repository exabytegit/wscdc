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
  const errors = [];
  if (!['CAE', 'CAEA', 'CAI'].includes(payload.cbteModo)) errors.push('Modalidad invalida.');
  if (!/^\d{11}$/.test(digits(payload.cuitEmisor))) errors.push('CUIT emisor debe tener 11 digitos.');
  if (!isPositiveInteger(payload.ptoVta)) errors.push('Punto de venta debe ser un entero positivo.');
  if (!isPositiveInteger(payload.cbteTipo)) errors.push('Tipo de comprobante debe ser un entero positivo.');
  if (!isPositiveInteger(payload.cbteNro)) errors.push('Numero de comprobante debe ser un entero positivo.');
  if (!isValidYyyymmdd(payload.cbteFch)) errors.push('Fecha debe tener formato AAAAMMDD valido.');
  if (!/^\d{1,13}([.,]\d{1,2})?$/.test(String(payload.impTotal || '')) || Number(String(payload.impTotal).replace(',', '.')) <= 0) {
    errors.push('Importe total debe ser positivo y tener hasta 2 decimales.');
  }
  if (!/^\d{14}$/.test(digits(payload.codAutorizacion))) errors.push('Codigo de autorizacion debe tener 14 digitos.');
  if (payload.docTipoReceptor && !/^\d{2}$/.test(String(payload.docTipoReceptor).trim())) errors.push('Tipo de documento receptor debe tener 2 digitos.');
  if (payload.docNroReceptor && !/^\d{1,11}$/.test(digits(payload.docNroReceptor))) errors.push('Numero de documento receptor debe tener hasta 11 digitos.');
  if ((payload.docTipoReceptor && !payload.docNroReceptor) || (!payload.docTipoReceptor && payload.docNroReceptor)) {
    errors.push('Documento receptor requiere tipo y numero.');
  }
  return errors;
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
