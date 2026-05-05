import { describe, expect, it } from 'vitest';
import { buildLoginCmsEnvelope, buildLoginTicketRequest, isTicketValid, parseLoginCmsResponse } from '../src/services/wsaa.js';

describe('wsaa service', () => {
  it('builds a LoginTicketRequest for wsapoc', () => {
    const xml = buildLoginTicketRequest({ service: 'wsapoc', now: new Date('2026-05-04T15:00:00.000Z') });
    expect(xml).toContain('<service>wsapoc</service>');
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
});
