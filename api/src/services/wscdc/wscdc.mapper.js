import { asArray, findFirst } from '../../utils/xml.js';

function normalizeMessage(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    code: Number(item.Code ?? item.code ?? 0),
    msg: String(item.Msg ?? item.msg ?? '').trim(),
  };
}

export function normalizeMessages(node, key) {
  const container = key ? findFirst(node, key) : node;
  const rawItems = [
    ...asArray(findFirst(container, 'Err')),
    ...asArray(findFirst(container, 'Evt')),
    ...asArray(findFirst(container, 'Obs')),
  ];
  return rawItems.map(normalizeMessage).filter(Boolean);
}

function normalizeCatalogItem(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    id: String(item.Id ?? item.Cod ?? '').trim(),
    descripcion: String(item.Desc ?? '').trim(),
    fechaDesde: String(item.FchDesde ?? '').trim(),
    fechaHasta: String(item.FchHasta ?? '').trim(),
  };
}

export function mapDummyResponse(parsed) {
  const result = findFirst(parsed, 'ComprobanteDummyResult') ?? parsed;
  return {
    appserver: String(findFirst(result, 'AppServer') ?? ''),
    dbserver: String(findFirst(result, 'DbServer') ?? ''),
    authserver: String(findFirst(result, 'AuthServer') ?? ''),
  };
}

export function mapCatalogResponse(parsed, operation) {
  const result = findFirst(parsed, `${operation}Result`) ?? parsed;
  const resultGet = findFirst(result, 'ResultGet') ?? result;
  const items = [
    ...asArray(findFirst(resultGet, 'FacModTipo')),
    ...asArray(findFirst(resultGet, 'CbteTipo')),
    ...asArray(findFirst(resultGet, 'DocTipo')),
    ...asArray(findFirst(resultGet, 'OpcionalTipo')),
  ].map(normalizeCatalogItem).filter((item) => item && item.id);

  return {
    items,
    errors: normalizeMessages(result, 'Errors'),
    events: normalizeMessages(result, 'Events'),
  };
}

function normalizeCmpResp(node) {
  const cmp = findFirst(node, 'CmpResp') ?? {};
  return {
    cbteModo: String(findFirst(cmp, 'CbteModo') ?? ''),
    cuitEmisor: String(findFirst(cmp, 'CuitEmisor') ?? ''),
    ptoVta: Number(findFirst(cmp, 'PtoVta') ?? 0),
    cbteTipo: Number(findFirst(cmp, 'CbteTipo') ?? 0),
    cbteNro: Number(findFirst(cmp, 'CbteNro') ?? 0),
    cbteFch: String(findFirst(cmp, 'CbteFch') ?? ''),
    impTotal: Number(findFirst(cmp, 'ImpTotal') ?? 0),
    codAutorizacion: String(findFirst(cmp, 'CodAutorizacion') ?? ''),
    docTipoReceptor: String(findFirst(cmp, 'DocTipoReceptor') ?? ''),
    docNroReceptor: String(findFirst(cmp, 'DocNroReceptor') ?? ''),
  };
}

function resolveVerdict(resultado, observaciones, errors) {
  if (errors.length) return 'rejected_format';
  if (resultado === 'A' && observaciones.length) return 'approved_with_observations';
  if (resultado === 'A') return 'approved';
  if (resultado === 'R' && observaciones.length) return 'rejected_business';
  if (resultado === 'R') return 'rejected';
  return 'unknown';
}

export function mapConstatarResponse(parsed) {
  const result = findFirst(parsed, 'ComprobanteConstatarResult') ?? parsed;
  const resultado = String(findFirst(result, 'Resultado') ?? '').trim();
  const observaciones = normalizeMessages(result, 'Observaciones');
  const errors = normalizeMessages(result, 'Errors');
  const events = normalizeMessages(result, 'Events');
  const verdict = resolveVerdict(resultado, observaciones, errors);

  return {
    ok: verdict === 'approved' || verdict === 'approved_with_observations',
    verdict,
    resultado,
    cmpResp: normalizeCmpResp(result),
    observaciones,
    errors,
    events,
    fchProceso: String(findFirst(result, 'FchProceso') ?? ''),
  };
}
