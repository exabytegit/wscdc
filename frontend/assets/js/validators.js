const digits = (value) => String(value || '').replace(/[-\s]/g, '');

export function validateConstatarForm(payload) {
  const errors = [];
  if (!['CAE', 'CAEA', 'CAI'].includes(payload.cbteModo)) errors.push('Modalidad invalida.');
  if (!/^\d{11}$/.test(digits(payload.cuitEmisor))) errors.push('CUIT emisor debe tener 11 digitos.');
  if (!/^\d{8}$/.test(payload.cbteFch)) errors.push('Fecha debe tener formato yyyymmdd.');
  if (!/^\d{14}$/.test(digits(payload.codAutorizacion))) errors.push('Codigo de autorizacion debe tener 14 digitos.');
  if (payload.docTipoReceptor && !/^\d{2}$/.test(String(payload.docTipoReceptor).trim())) errors.push('Tipo de documento receptor debe tener 2 digitos.');
  if (payload.docNroReceptor && !/^\d{1,11}$/.test(digits(payload.docNroReceptor))) errors.push('Numero de documento receptor debe tener hasta 11 digitos.');
  if ((payload.docTipoReceptor && !payload.docNroReceptor) || (!payload.docTipoReceptor && payload.docNroReceptor)) {
    errors.push('Documento receptor requiere tipo y numero.');
  }
  return errors;
}
