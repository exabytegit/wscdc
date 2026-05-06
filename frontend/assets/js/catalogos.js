export const MODALIDADES = [
  { value: 'CAE', label: 'CAE' },
  { value: 'CAI', label: 'CAI' },
  { value: 'CAEA', label: 'CAEA' },
];

export const TIPOS_COMPROBANTE = [
  { value: '1', label: '1 - Factura A' },
  { value: '2', label: '2 - Nota de Debito A' },
  { value: '3', label: '3 - Nota de Credito A' },
  { value: '4', label: '4 - Recibo A' },
  { value: '5', label: '5 - Nota de Venta al Contado A' },
  { value: '6', label: '6 - Factura B' },
  { value: '7', label: '7 - Nota de Debito B' },
  { value: '8', label: '8 - Nota de Credito B' },
  { value: '9', label: '9 - Recibo B' },
  { value: '10', label: '10 - Nota de Venta al Contado B' },
  { value: '11', label: '11 - Factura C' },
  { value: '12', label: '12 - Nota de Debito C' },
  { value: '13', label: '13 - Nota de Credito C' },
  { value: '15', label: '15 - Recibo C' },
  { value: '19', label: '19 - Factura de Exportacion' },
  { value: '20', label: '20 - Nota Deb. P/Operac. con el Exterior' },
  { value: '21', label: '21 - Nota Cred. P/Operac. con el Exterior' },
  { value: '39', label: '39 - Otros Comprobantes A que Cumplan con la R.G. Nro. 1415' },
  { value: '40', label: '40 - Otros Comprobantes B que Cumplan con la R.G. Nro. 1415' },
  { value: '49', label: '49 - Comprobante de Compra de Bienes Usados' },
  { value: '51', label: '51 - Factura "M" / A con Leyenda "Operacion Sujeta a Retencion"' },
  { value: '52', label: '52 - Nota de Debito "M" / A con Leyenda "Operacion Sujeta a Retencion"' },
  { value: '53', label: '53 - Nota de Credito "M" / A con Leyenda "Operacion Sujeta a Retencion"' },
  { value: '54', label: '54 - Recibo "M" / A con Leyenda "Operacion Sujeta a Retencion"' },
  { value: '60', label: '60 - Cta. de Vta. y Liquido Prod. A' },
  { value: '61', label: '61 - Cta. de Vta. y Liquido Prod. B' },
  { value: '63', label: '63 - Liquidacion A' },
  { value: '64', label: '64 - Liquidacion B' },
  { value: '109', label: '109 - Tique C' },
  { value: '114', label: '114 - Tique Nota de Credito C' },
  { value: '195', label: '195 - Factura T' },
  { value: '196', label: '196 - Nota de Debito T' },
  { value: '197', label: '197 - Nota de Credito T' },
  { value: '201', label: '201 - Factura de Credito electronica MiPyMEs (FCE) A' },
  { value: '202', label: '202 - Nota de Debito electronica MiPyMEs (FCE) A' },
  { value: '203', label: '203 - Nota de Credito electronica MiPyMEs (FCE) A' },
  { value: '206', label: '206 - Factura de Credito electronica MiPyMEs (FCE) B' },
  { value: '207', label: '207 - Nota de Debito electronica MiPyMEs (FCE) B' },
  { value: '208', label: '208 - Nota de Credito electronica MiPyMEs (FCE) B' },
  { value: '211', label: '211 - Factura de Credito electronica MiPyMEs (FCE) C' },
  { value: '212', label: '212 - Nota de Debito electronica MiPyMEs (FCE) C' },
  { value: '213', label: '213 - Nota de Credito electronica MiPyMEs (FCE) C' },
];

export const TIPOS_DOCUMENTO = [
  { value: '00', label: '00 - CI Policia Federal' },
  { value: '01', label: '01 - CI Buenos Aires' },
  { value: '02', label: '02 - CI Catamarca' },
  { value: '03', label: '03 - CI Cordoba' },
  { value: '04', label: '04 - CI Corrientes' },
  { value: '05', label: '05 - CI Entre Rios' },
  { value: '06', label: '06 - CI Jujuy' },
  { value: '07', label: '07 - CI Mendoza' },
  { value: '08', label: '08 - CI La Rioja' },
  { value: '09', label: '09 - CI Salta' },
  { value: '10', label: '10 - CI San Juan' },
  { value: '11', label: '11 - CI San Luis' },
  { value: '12', label: '12 - CI Santa Fe' },
  { value: '13', label: '13 - CI Santiago del Estero' },
  { value: '14', label: '14 - CI Tucuman' },
  { value: '16', label: '16 - CI Chaco' },
  { value: '17', label: '17 - CI Chubut' },
  { value: '18', label: '18 - CI Formosa' },
  { value: '19', label: '19 - CI Misiones' },
  { value: '20', label: '20 - CI Neuquen' },
  { value: '21', label: '21 - CI La Pampa' },
  { value: '22', label: '22 - CI Rio Negro' },
  { value: '23', label: '23 - CI Santa Cruz' },
  { value: '24', label: '24 - CI Tierra del Fuego' },
  { value: '80', label: '80 - CUIT' },
  { value: '86', label: '86 - CUIL' },
  { value: '87', label: '87 - CDI' },
  { value: '89', label: '89 - LE' },
  { value: '90', label: '90 - LC' },
  { value: '91', label: '91 - CI Extranjera' },
  { value: '92', label: '92 - en tramite' },
  { value: '93', label: '93 - Acta Nacimiento' },
  { value: '94', label: '94 - Pasaporte' },
  { value: '95', label: '95 - CI Bs. As. RNP' },
  { value: '96', label: '96 - DNI' },
  { value: '99', label: '99 - Doc. (otro)' },
];

function getLabel(items, code, fallbackPrefix) {
  const normalized = String(code ?? '').trim();
  if (!normalized) return '';
  const match = items.find((item) => item.value === normalized);
  return match?.label ?? `${fallbackPrefix} ${normalized}`;
}

export function getTipoComprobanteLabel(code) {
  return getLabel(TIPOS_COMPROBANTE, code, 'Tipo');
}

export function getDocumentoTipoLabel(code) {
  return getLabel(TIPOS_DOCUMENTO, code, 'Documento');
}

export function formatPuntoVenta(ptoVta) {
  return String(Number(ptoVta || 0)).padStart(5, '0');
}

export function formatComprobanteNumero(cbteNro) {
  return String(Number(cbteNro || 0)).padStart(8, '0');
}

export function formatFechaAAAAMMDDToDDMMYYYY(value) {
  const raw = String(value || '');
  if (!/^\d{8}$/.test(raw)) return raw;
  return `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`;
}
