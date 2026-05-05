import axios from 'axios';
import { config } from '../../config.js';
import { ApiError, normalizeExternalError } from '../../errors.js';
import { asArray, escapeXml, findFirst, parseXml } from '../../utils/xml.js';
import { createWsaaClient } from '../wsaa.js';
import {
  mapCatalogResponse,
  mapConstatarResponse,
  mapDummyResponse,
  normalizeMessages,
} from './wscdc.mapper.js';
import { validateConstatarPayload } from './wscdc.validators.js';

export const WSCDC_OPERATIONS = {
  dummy: 'ComprobanteDummy',
  modalidades: 'ComprobantesModalidadConsultar',
  comprobantes: 'ComprobantesTipoConsultar',
  documentos: 'DocumentosTipoConsultar',
  opcionales: 'OpcionalesTipoConsultar',
  constatar: 'ComprobanteConstatar',
};

export function buildSoapAction(operation) {
  return `${config.WSCDC_NAMESPACE.replace(/\/?$/, '/')}${operation}`;
}

export function buildEnvelope(operation, innerXml = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${operation} xmlns="${config.WSCDC_NAMESPACE}">
      ${innerXml}
    </${operation}>
  </soap:Body>
</soap:Envelope>`;
}

export function authXml(ticket) {
  return `<Auth>
  <Token>${escapeXml(ticket.token)}</Token>
  <Sign>${escapeXml(ticket.sign)}</Sign>
  <Cuit>${escapeXml(config.ARCA_CUIT)}</Cuit>
</Auth>`;
}

export function cmpReqXml(payload) {
  const opcionales = asArray(payload.opcionales).map((opcional) => `<Opcional>
      <Id>${escapeXml(opcional.id)}</Id>
      <Valor>${escapeXml(opcional.valor)}</Valor>
    </Opcional>`).join('');

  return `<CmpReq>
  <CbteModo>${escapeXml(payload.cbteModo)}</CbteModo>
  <CuitEmisor>${escapeXml(payload.cuitEmisor)}</CuitEmisor>
  <PtoVta>${escapeXml(payload.ptoVta)}</PtoVta>
  <CbteTipo>${escapeXml(payload.cbteTipo)}</CbteTipo>
  <CbteNro>${escapeXml(payload.cbteNro)}</CbteNro>
  <CbteFch>${escapeXml(payload.cbteFch)}</CbteFch>
  <ImpTotal>${escapeXml(payload.impTotal)}</ImpTotal>
  <CodAutorizacion>${escapeXml(payload.codAutorizacion)}</CodAutorizacion>
  ${payload.docTipoReceptor ? `<DocTipoReceptor>${escapeXml(payload.docTipoReceptor)}</DocTipoReceptor>` : ''}
  ${payload.docNroReceptor ? `<DocNroReceptor>${escapeXml(payload.docNroReceptor)}</DocNroReceptor>` : ''}
  ${opcionales ? `<Opcionales>${opcionales}</Opcionales>` : ''}
</CmpReq>`;
}

function assertNoSoapFault(xml) {
  const parsed = parseXml(xml);
  const faultString = findFirst(parsed, 'faultstring');
  if (faultString) {
    throw new ApiError({ status: 502, descripcion: faultString, scenario: 'SOAP_FAULT' });
  }
  return parsed;
}

export class WscdcClient {
  constructor({ httpClient = axios, wsaaClient = createWsaaClient(httpClient) } = {}) {
    this.httpClient = httpClient;
    this.wsaaClient = wsaaClient;
  }

  async post(operation, innerXml = '') {
    const envelope = buildEnvelope(operation, innerXml);
    try {
      const { data } = await this.httpClient.post(config.WSCDC_URL, envelope, {
        timeout: config.REQUEST_TIMEOUT_MS,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: buildSoapAction(operation),
        },
      });
      return data;
    } catch (error) {
      throw normalizeExternalError(error, `Error al invocar WSCDC ${operation}`);
    }
  }

  async dummy() {
    const xml = await this.post(WSCDC_OPERATIONS.dummy);
    return mapDummyResponse(assertNoSoapFault(xml));
  }

  async catalog(operation) {
    const ticket = await this.wsaaClient.getAccessTicket();
    const xml = await this.post(operation, authXml(ticket));
    return mapCatalogResponse(assertNoSoapFault(xml), operation);
  }

  async constatar(payload) {
    const normalizedPayload = validateConstatarPayload(payload);
    throw new ApiError({
      status: 501,
      descripcion: 'ComprobanteConstatar queda pendiente hasta validar casos oficiales de homologacion.',
      scenario: 'CONSTATAR_PENDING_OFFICIAL_CASES',
      codigo: null,
      cause: { payload: normalizedPayload },
    });
  }

  mapConstatarXml(xml) {
    return mapConstatarResponse(assertNoSoapFault(xml));
  }

  normalizeMessages(node) {
    return normalizeMessages(node);
  }
}

let singleton = null;

export function getWscdcClient() {
  if (!singleton) singleton = new WscdcClient();
  return singleton;
}
