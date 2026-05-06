import axios from 'axios';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { config } from '../config.js';
import { ApiError, normalizeExternalError } from '../errors.js';
import { logger } from '../logger.js';
import { escapeXml, findFirst, parseXml } from '../utils/xml.js';
import { toWsaaTimestamp } from '../utils/date.js';

const execFileAsync = promisify(execFile);
const persistedTicketPath = getTicketCachePath();

let cachedTa = null;

export function clearTicketCache() {
  cachedTa = null;
}

export function getTicketCachePath({
  cacheDir = config.TA_CACHE_DIR,
  arcaEnv = config.ARCA_ENV,
  service = config.ARCA_SERVICE,
} = {}) {
  return path.join(cacheDir, `ta-${arcaEnv}-${service}.json`);
}

function normalizeTicket(ticket) {
  if (!ticket?.token || !ticket?.sign || !ticket?.expirationTime) return null;
  return {
    token: ticket.token,
    sign: ticket.sign,
    expirationTime: ticket.expirationTime instanceof Date ? ticket.expirationTime : new Date(ticket.expirationTime),
  };
}

export async function readPersistedTicket(cachePath = persistedTicketPath) {
  try {
    const raw = await fs.readFile(cachePath, 'utf8');
    return normalizeTicket(JSON.parse(raw));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw new ApiError({
      status: 500,
      descripcion: 'No se pudo leer el TA persistido localmente.',
      scenario: 'TA_CACHE_READ_ERROR',
      cause: error,
    });
  }
}

export async function persistTicket(ticket, cachePath = persistedTicketPath) {
  const normalized = normalizeTicket(ticket);
  if (!normalized) return;

  try {
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify({
      token: normalized.token,
      sign: normalized.sign,
      expirationTime: normalized.expirationTime.toISOString(),
    }, null, 2));
  } catch (error) {
    throw new ApiError({
      status: 500,
      descripcion: 'No se pudo persistir el TA localmente.',
      scenario: 'TA_CACHE_WRITE_ERROR',
      cause: error,
    });
  }
}

export function buildLoginTicketRequest({ service = config.ARCA_SERVICE, now = new Date() } = {}) {
  const generationTime = new Date(now.getTime() - 5 * 60 * 1000);
  const expirationTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const uniqueId = Math.floor(now.getTime() / 1000);

  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${uniqueId}</uniqueId>
    <generationTime>${toWsaaTimestamp(generationTime)}</generationTime>
    <expirationTime>${toWsaaTimestamp(expirationTime)}</expirationTime>
  </header>
  <service>${escapeXml(service)}</service>
</loginTicketRequest>`;
}

export async function signCmsWithOpenSsl(xml, options = {}) {
  const certPath = options.certPath || config.ARCA_CERT_PATH;
  const keyPath = options.keyPath || config.ARCA_KEY_PATH;
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wsaa-'));
  const xmlPath = path.join(tmpDir, 'LoginTicketRequest.xml');
  const cmsPath = path.join(tmpDir, 'LoginTicketRequest.cms');

  try {
    await fs.writeFile(xmlPath, xml, 'utf8');
    await execFileAsync(config.OPENSSL_BIN, [
      'cms',
      '-sign',
      '-in', xmlPath,
      '-signer', certPath,
      '-inkey', keyPath,
      '-outform', 'DER',
      '-nodetach',
      '-out', cmsPath,
    ], { windowsHide: true, timeout: config.REQUEST_TIMEOUT_MS });

    const cms = await fs.readFile(cmsPath);
    return cms.toString('base64');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new ApiError({ status: 500, descripcion: 'OpenSSL no esta disponible en PATH.', scenario: 'OPENSSL_NOT_FOUND', cause: error });
    }
    throw new ApiError({ status: 500, descripcion: 'No se pudo firmar el LoginTicketRequest con OpenSSL.', scenario: 'CMS_SIGN_ERROR', cause: error });
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

export function buildLoginCmsEnvelope(cmsBase64) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${escapeXml(cmsBase64)}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export function parseLoginCmsResponse(xml) {
  const parsed = parseXml(xml);
  const faultString = findFirst(parsed, 'faultstring');
  if (faultString) {
    const alreadyAuthenticated = /ya posee un TA valido/i.test(faultString);
    throw new ApiError({
      status: alreadyAuthenticated ? 409 : 401,
      descripcion: faultString,
      scenario: alreadyAuthenticated ? 'ALREADY_AUTHENTICATED' : 'AUTH_EXPIRED',
    });
  }

  const loginCmsReturn = findFirst(parsed, 'loginCmsReturn');
  if (!loginCmsReturn || typeof loginCmsReturn !== 'string') {
    throw new ApiError({ status: 502, descripcion: 'Respuesta WSAA invalida: no se encontro loginCmsReturn.', scenario: 'SOAP_FAULT' });
  }

  const ticket = parseXml(loginCmsReturn);
  const token = findFirst(ticket, 'token');
  const sign = findFirst(ticket, 'sign');
  const expirationTime = findFirst(ticket, 'expirationTime');

  if (!token || !sign || !expirationTime) {
    throw new ApiError({ status: 502, descripcion: 'Respuesta WSAA invalida: TA incompleto.', scenario: 'SOAP_FAULT' });
  }

  return {
    token,
    sign,
    expirationTime: new Date(expirationTime),
  };
}

export function isTicketValid(ticket = cachedTa, now = new Date()) {
  if (!ticket?.token || !ticket?.sign || !ticket?.expirationTime) return false;
  const expiresAt = ticket.expirationTime instanceof Date ? ticket.expirationTime : new Date(ticket.expirationTime);
  const renewAt = expiresAt.getTime() - config.TA_RENEW_SKEW_SECONDS * 1000;
  return now.getTime() < renewAt;
}

export async function requestNewTicket(httpClient = axios) {
  try {
    const tra = buildLoginTicketRequest();
    const cms = await signCmsWithOpenSsl(tra);
    const envelope = buildLoginCmsEnvelope(cms);
    const { data } = await httpClient.post(config.WSAA_URL, envelope, {
      timeout: config.REQUEST_TIMEOUT_MS,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: '',
      },
    });

    return parseLoginCmsResponse(data);
  } catch (error) {
    if (typeof error?.response?.data === 'string') {
      try {
        return parseLoginCmsResponse(error.response.data);
      } catch (parsedError) {
        if (parsedError instanceof ApiError) throw parsedError;
      }
    }

    throw normalizeExternalError(error, 'Error al solicitar Ticket de Acceso WSAA');
  }
}

export async function getAccessTicket(httpClient = axios, { cachePath = persistedTicketPath } = {}) {
  if (isTicketValid(cachedTa)) return cachedTa;

  const persistedTicket = await readPersistedTicket(cachePath);
  if (isTicketValid(persistedTicket)) {
    cachedTa = persistedTicket;
    logger.info({ arcaEnv: config.ARCA_ENV, service: config.ARCA_SERVICE }, 'TA cargado desde cache');
    return cachedTa;
  }

  try {
    cachedTa = await requestNewTicket(httpClient);
    await persistTicket(cachedTa, cachePath);
    logger.info({ arcaEnv: config.ARCA_ENV, service: config.ARCA_SERVICE }, 'TA generado nuevo');
    return cachedTa;
  } catch (error) {
    if (error instanceof ApiError && error.scenario === 'ALREADY_AUTHENTICATED') {
      const recoveredTicket = await readPersistedTicket(cachePath);
      if (isTicketValid(recoveredTicket)) {
        cachedTa = recoveredTicket;
        logger.info({ arcaEnv: config.ARCA_ENV, service: config.ARCA_SERVICE }, 'TA cargado desde cache');
        return cachedTa;
      }

      throw new ApiError({
        status: 503,
        descripcion: 'WSAA informo que ya existe un TA valido, pero esta instancia no tiene un TA persistido para reutilizar.',
        scenario: 'TA_RECOVERY_REQUIRED',
        cause: error,
      });
    }

    throw error;
  }
}

export function createWsaaClient(httpClient = axios) {
  return {
    getAccessTicket: () => getAccessTicket(httpClient),
    clearTicketCache,
    _cacheKey: crypto.randomUUID(),
  };
}
