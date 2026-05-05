import { XMLParser } from 'fast-xml-parser';

export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
});

export function parseXml(xml) {
  return xmlParser.parse(xml);
}

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function findFirst(node, key) {
  if (!node || typeof node !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(node, key)) return node[key];

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findFirst(item, key);
        if (found !== undefined) return found;
      }
      continue;
    }

    const found = findFirst(value, key);
    if (found !== undefined) return found;
  }

  return undefined;
}

export function asArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}
