import axios from 'axios';
import { config } from '../config.js';
import { ApiError, mapWsCodeToError, normalizeExternalError } from '../errors.js';
import { normalizeWsDate } from '../utils/date.js';
import { asArray, escapeXml, findFirst, parseXml } from '../utils/xml.js';
import { createWsaaClient } from './wsaa.js';

function buildEnvelope(operation, innerXml = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${operation} xmlns="${config.WSAPOC_NAMESPACE}">
      ${innerXml}
    </${operation}>
  </soap:Body>
</soap:Envelope>`;
}

function credentialXml(ticket) {
  return `<Credencial>
  <Token>${escapeXml(ticket.token)}</Token>
  <Sign>${escapeXml(ticket.sign)}</Sign>
  <CUITDelegado>${escapeXml(config.ARCA_CUIT_DELEGADO)}</CUITDelegado>
</Credencial>`;
}

function buildSoapAction(operation) {
  const namespace = config.WSAPOC_NAMESPACE.replace(/\/?$/, '/');
  return `${namespace}Service/${operation}`;
}

function normalizePublication(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    CUIT: String(item.CUIT ?? item.Cuit ?? '').trim(),
    Descripcion: String(item.Descripcion ?? item.descripcion ?? '').trim(),
    FechaCondicion: normalizeWsDate(item.FechaCondicion ?? item.fechaCondicion ?? ''),
    FechaPublicacion: normalizeWsDate(item.FechaPublicacion ?? item.fechaPublicacion ?? ''),
  };
}

function extractPublications(result) {
  const direct = asArray(findFirst(result, 'PublicacionAPOC'));
  const fallback = asArray(findFirst(result, 'Publicacion'));
  return [...direct, ...fallback]
    .map(normalizePublication)
    .filter((item) => item && item.CUIT);
}

function normalizeMessageResponse(xml, operation) {
  const parsed = parseXml(xml);
  const faultString = findFirst(parsed, 'faultstring');
  if (faultString) {
    throw new ApiError({ status: 502, descripcion: faultString, scenario: 'SOAP_FAULT' });
  }

  const responseNode = findFirst(parsed, `${operation}Response`) ?? parsed;
  const resultNode = findFirst(responseNode, `${operation}Result`) ?? findFirst(responseNode, 'MessageResponse') ?? responseNode;
  const codigo = Number(findFirst(resultNode, 'Codigo') ?? findFirst(resultNode, 'codigo') ?? 0);
  const descripcion = String(findFirst(resultNode, 'Descripcion') ?? findFirst(resultNode, 'descripcion') ?? 'Ejecucion exitosa.');
  const mappedError = mapWsCodeToError(codigo, descripcion);
  if (mappedError) throw mappedError;

  return {
    codigo,
    descripcion,
    resultNode,
    publications: extractPublications(resultNode),
  };
}

export class WsapocClient {
  constructor({ httpClient = axios, wsaaClient = createWsaaClient(httpClient) } = {}) {
    this.httpClient = httpClient;
    this.wsaaClient = wsaaClient;
  }

  async post(operation, innerXml = '') {
    const envelope = buildEnvelope(operation, innerXml);
    try {
      const { data } = await this.httpClient.post(config.WSAPOC_URL, envelope, {
        timeout: config.REQUEST_TIMEOUT_MS,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: buildSoapAction(operation),
        },
      });
      return data;
    } catch (error) {
      throw normalizeExternalError(error, `Error al invocar WSAPOC ${operation}`);
    }
  }

  async dummy() {
    const xml = await this.post('Dummy');
    const parsed = parseXml(xml);
    const faultString = findFirst(parsed, 'faultstring');
    if (faultString) {
      throw new ApiError({ status: 502, descripcion: faultString, scenario: 'SOAP_FAULT' });
    }

    const response = findFirst(parsed, 'DummyResponse') ?? parsed;
    const result = findFirst(response, 'DummyResult') ?? response;
    return {
      appserver: String(findFirst(result, 'appserver') ?? ''),
      dbserver: String(findFirst(result, 'dbserver') ?? ''),
      authserver: String(findFirst(result, 'authserver') ?? ''),
    };
  }

  async getPublicacionApoc(cuit) {
    const ticket = await this.wsaaClient.getAccessTicket();
    const xml = await this.post('GetPublicacionAPOC', `${credentialXml(ticket)}<cuit>${escapeXml(cuit)}</cuit>`);
    const normalized = normalizeMessageResponse(xml, 'GetPublicacionAPOC');
    return {
      codigo: normalized.codigo,
      descripcion: normalized.publications.length ? normalized.descripcion : 'No se encontraron resultados.',
      resultado: normalized.publications[0] ?? null,
    };
  }

  async getAllByPublicacion(desde, hasta) {
    const ticket = await this.wsaaClient.getAccessTicket();
    const xml = await this.post('GetAllByPublicacion', `${credentialXml(ticket)}<desde>${escapeXml(desde)}</desde><hasta>${escapeXml(hasta)}</hasta>`);
    const normalized = normalizeMessageResponse(xml, 'GetAllByPublicacion');
    return {
      codigo: normalized.codigo,
      descripcion: normalized.descripcion,
      items: normalized.publications,
    };
  }
}

let singleton = null;

export function getWsapocClient() {
  if (!singleton) singleton = new WsapocClient();
  return singleton;
}
