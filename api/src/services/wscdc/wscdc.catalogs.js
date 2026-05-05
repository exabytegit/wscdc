import { WSCDC_OPERATIONS } from './wscdc.soap.js';

const TTL_MS = 12 * 60 * 60 * 1000;
const cache = new Map();

export const CATALOG_OPERATIONS = {
  modalidades: WSCDC_OPERATIONS.modalidades,
  comprobantes: WSCDC_OPERATIONS.comprobantes,
  documentos: WSCDC_OPERATIONS.documentos,
  opcionales: WSCDC_OPERATIONS.opcionales,
};

export function clearCatalogCache() {
  cache.clear();
}

export async function getCatalog(client, name, { now = Date.now(), refresh = false } = {}) {
  const operation = CATALOG_OPERATIONS[name];
  if (!operation) return null;

  const cached = cache.get(name);
  if (!refresh && cached && cached.expiresAt > now) return cached.value;

  const value = await client.catalog(operation);
  cache.set(name, { value, expiresAt: now + TTL_MS });
  return value;
}
