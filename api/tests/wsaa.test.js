import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildLoginCmsEnvelope,
  buildLoginTicketRequest,
  clearTicketCache,
  getAccessTicket,
  getTicketCachePath,
  isTicketValid,
  parseLoginCmsResponse,
  persistTicket,
  readPersistedTicket,
} from '../src/services/wsaa.js';

let tmpDirs = [];

async function makeTmpDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wscdc-wsaa-test-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(async () => {
  clearTicketCache();
  await Promise.all(tmpDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
  tmpDirs = [];
});

describe('wsaa service', () => {
  it('builds a LoginTicketRequest for wscdc', () => {
    const xml = buildLoginTicketRequest({ service: 'wscdc', now: new Date('2026-05-04T15:00:00.000Z') });
    expect(xml).toContain('<service>wscdc</service>');
    expect(xml).toContain('<uniqueId>1777906800</uniqueId>');
  });

  it('builds loginCms SOAP envelope', () => {
    const xml = buildLoginCmsEnvelope('abc123');
    expect(xml).toContain('<wsaa:loginCms>');
    expect(xml).toContain('<wsaa:in0>abc123</wsaa:in0>');
  });

  it('parses loginCmsReturn into a ticket', () => {
    const ticketXml = `&lt;loginTicketResponse&gt;&lt;header&gt;&lt;expirationTime&gt;2026-05-04T23:00:00.000-03:00&lt;/expirationTime&gt;&lt;/header&gt;&lt;credentials&gt;&lt;token&gt;tok&lt;/token&gt;&lt;sign&gt;sig&lt;/sign&gt;&lt;/credentials&gt;&lt;/loginTicketResponse&gt;`;
    const soap = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><loginCmsResponse><loginCmsReturn>${ticketXml}</loginCmsReturn></loginCmsResponse></soap:Body></soap:Envelope>`;
    const parsed = parseLoginCmsResponse(soap);
    expect(parsed.token).toBe('tok');
    expect(parsed.sign).toBe('sig');
    expect(parsed.expirationTime).toBeInstanceOf(Date);
  });

  it('classifies alreadyAuthenticated faults explicitly', () => {
    const soap = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><soap:Fault><faultstring>El CEE ya posee un TA valido para el acceso al WSN solicitado</faultstring></soap:Fault></soap:Body></soap:Envelope>`;
    try {
      parseLoginCmsResponse(soap);
      throw new Error('Expected parseLoginCmsResponse to throw');
    } catch (error) {
      expect(error).toMatchObject({
        status: 409,
        scenario: 'ALREADY_AUTHENTICATED',
      });
    }
  });

  it('detects valid tickets with renewal skew', () => {
    expect(isTicketValid({
      token: 'tok',
      sign: 'sig',
      expirationTime: new Date('2026-05-04T16:00:00.000Z'),
    }, new Date('2026-05-04T15:00:00.000Z'))).toBe(true);
  });

  it('builds TA cache path separated by environment and service', () => {
    const cachePath = getTicketCachePath({
      cacheDir: 'tmp',
      arcaEnv: 'produccion',
      service: 'wscdc',
    });

    expect(cachePath).toBe(path.join('tmp', 'ta-produccion-wscdc.json'));
  });

  it('persists and reads tickets using the WSAPOC-compatible JSON shape', async () => {
    const cachePath = path.join(await makeTmpDir(), 'ta-homologacion-wscdc.json');

    await persistTicket({
      token: 'tok',
      sign: 'sig',
      expirationTime: new Date('2026-05-04T23:00:00.000Z'),
    }, cachePath);

    const raw = JSON.parse(await fs.readFile(cachePath, 'utf8'));
    expect(raw).toEqual({
      token: 'tok',
      sign: 'sig',
      expirationTime: '2026-05-04T23:00:00.000Z',
    });

    const ticket = await readPersistedTicket(cachePath);
    expect(ticket).toMatchObject({ token: 'tok', sign: 'sig' });
    expect(ticket.expirationTime).toBeInstanceOf(Date);
  });

  it('reuses a valid TA from disk without requesting a new one', async () => {
    const cachePath = path.join(await makeTmpDir(), 'ta-produccion-wscdc.json');
    const httpClient = { post: vi.fn() };

    await persistTicket({
      token: 'cached-token',
      sign: 'cached-sign',
      expirationTime: new Date(Date.now() + 60 * 60 * 1000),
    }, cachePath);

    const ticket = await getAccessTicket(httpClient, { cachePath });

    expect(ticket).toMatchObject({
      token: 'cached-token',
      sign: 'cached-sign',
    });
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});
