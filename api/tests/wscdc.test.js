import { describe, expect, it, vi } from 'vitest';
import { WscdcClient, buildEnvelope, buildSoapAction, WSCDC_OPERATIONS } from '../src/services/wscdc/wscdc.soap.js';
import { mapCatalogResponse, mapConstatarResponse, mapDummyResponse } from '../src/services/wscdc/wscdc.mapper.js';
import { parseXml } from '../src/utils/xml.js';

describe('wscdc soap client', () => {
  it('builds official SOAPAction', () => {
    expect(buildSoapAction(WSCDC_OPERATIONS.dummy)).toBe('http://servicios1.afip.gob.ar/wscdc/ComprobanteDummy');
  });

  it('builds an envelope with WSCDC namespace', () => {
    const xml = buildEnvelope(WSCDC_OPERATIONS.dummy);
    expect(xml).toContain('<ComprobanteDummy xmlns="http://servicios1.afip.gob.ar/wscdc/">');
  });

  it('maps dummy response', () => {
    const parsed = parseXml(`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ComprobanteDummyResponse><ComprobanteDummyResult><AppServer>OK</AppServer><DbServer>OK</DbServer><AuthServer>OK</AuthServer></ComprobanteDummyResult></ComprobanteDummyResponse></soap:Body></soap:Envelope>`);
    expect(mapDummyResponse(parsed)).toEqual({ appserver: 'OK', dbserver: 'OK', authserver: 'OK' });
  });

  it('maps catalog response with events and errors', () => {
    const parsed = parseXml(`<ComprobantesModalidadConsultarResult><ResultGet><FacModTipo><Cod>CAE</Cod><Desc>Factura Electronica</Desc><FchDesde>20110101</FchDesde><FchHasta></FchHasta></FacModTipo></ResultGet><Errors><Err><Code>0</Code><Msg></Msg></Err></Errors><Events><Evt><Code>1</Code><Msg>Info</Msg></Evt></Events></ComprobantesModalidadConsultarResult>`);
    const mapped = mapCatalogResponse(parsed, 'ComprobantesModalidadConsultar');
    expect(mapped.items[0]).toMatchObject({ id: 'CAE', descripcion: 'Factura Electronica' });
    expect(mapped.errors[0].code).toBe(0);
    expect(mapped.events[0].msg).toBe('Info');
  });

  it('maps constatar response verdicts', () => {
    const parsed = parseXml(`<ComprobanteConstatarResult><CmpResp><CbteModo>CAE</CbteModo><CuitEmisor>20111111112</CuitEmisor></CmpResp><Resultado>A</Resultado><Observaciones><Obs><Code>10</Code><Msg>Obs</Msg></Obs></Observaciones><FchProceso>20260505120000</FchProceso></ComprobanteConstatarResult>`);
    expect(mapConstatarResponse(parsed)).toMatchObject({
      verdict: 'approved_with_observations',
      resultado: 'A',
      observaciones: [{ code: 10, msg: 'Obs' }],
    });
  });

  it('posts dummy to configured client', async () => {
    const httpClient = { post: vi.fn().mockResolvedValue({ data: `<ComprobanteDummyResult><AppServer>OK</AppServer><DbServer>OK</DbServer><AuthServer>OK</AuthServer></ComprobanteDummyResult>` }) };
    const client = new WscdcClient({ httpClient, wsaaClient: { getAccessTicket: vi.fn() } });
    await expect(client.dummy()).resolves.toMatchObject({ appserver: 'OK' });
    expect(httpClient.post.mock.calls[0][2].headers.SOAPAction).toBe('http://servicios1.afip.gob.ar/wscdc/ComprobanteDummy');
  });
});
