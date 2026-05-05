import { describe, expect, it, vi } from 'vitest';
import { WsapocClient } from '../src/services/wsapoc.js';

describe('wsapoc client', () => {
  it('uses the WSDL operation casing and soapAction for dummy', async () => {
    const httpClient = {
      post: vi.fn().mockResolvedValue({
        data: `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><DummyResponse><DummyResult><appserver>OK</appserver><dbserver>OK</dbserver><authserver>OK</authserver></DummyResult></DummyResponse></soap:Body></soap:Envelope>`,
      }),
    };
    const client = new WsapocClient({ httpClient, wsaaClient: { getAccessTicket: vi.fn() } });

    const response = await client.dummy();

    expect(response).toEqual({
      appserver: 'OK',
      dbserver: 'OK',
      authserver: 'OK',
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('<Dummy xmlns="http://tempuri.org/">'),
      expect.objectContaining({
        headers: expect.objectContaining({
          SOAPAction: 'http://tempuri.org/Service/Dummy',
        }),
      }),
    );
  });

  it('normalizes GetPublicacionAPOC response', async () => {
    const httpClient = {
      post: vi.fn().mockResolvedValue({
        data: `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetPublicacionAPOCResponse><GetPublicacionAPOCResult><codigo>0</codigo><descripcion>Ejecucion exitosa.</descripcion><resultados><PublicacionAPOC><Cuit>20111111112</Cuit><Descripcion>TEST</Descripcion><FechaCondicion>2026-01-01T00:00:00</FechaCondicion><FechaPublicacion>02/01/2026</FechaPublicacion></PublicacionAPOC></resultados></GetPublicacionAPOCResult></GetPublicacionAPOCResponse></soap:Body></soap:Envelope>`,
      }),
    };
    const wsaaClient = { getAccessTicket: vi.fn().mockResolvedValue({ token: 'tok', sign: 'sig' }) };
    const client = new WsapocClient({ httpClient, wsaaClient });

    const response = await client.getPublicacionApoc('20111111112');

    expect(response.resultado).toEqual({
      CUIT: '20111111112',
      Descripcion: 'TEST',
      FechaCondicion: '01/01/2026',
      FechaPublicacion: '02/01/2026',
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('<cuit>20111111112</cuit>'),
      expect.any(Object),
    );
  });

  it('maps WSAPOC code 201 as auth error', async () => {
    const httpClient = {
      post: vi.fn().mockResolvedValue({
        data: `<Envelope><Body><GetAllByPublicacionResponse><GetAllByPublicacionResult><Codigo>201</Codigo><Descripcion>Credenciales invalidas</Descripcion></GetAllByPublicacionResult></GetAllByPublicacionResponse></Body></Envelope>`,
      }),
    };
    const wsaaClient = { getAccessTicket: vi.fn().mockResolvedValue({ token: 'tok', sign: 'sig' }) };
    const client = new WsapocClient({ httpClient, wsaaClient });

    await expect(client.getAllByPublicacion('01/01/2026', '31/01/2026')).rejects.toMatchObject({
      status: 401,
      codigo: 201,
      scenario: 'AUTH_EXPIRED',
    });
  });
});
