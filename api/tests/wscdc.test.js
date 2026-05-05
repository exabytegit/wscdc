import { describe, expect, it, vi } from 'vitest';
import { WscdcClient, buildEnvelope, buildSoapAction, cmpReqXml, WSCDC_OPERATIONS } from '../src/services/wscdc/wscdc.soap.js';
import { mapCatalogResponse, mapConstatarResponse, mapDummyResponse } from '../src/services/wscdc/wscdc.mapper.js';
import { parseXml } from '../src/utils/xml.js';

describe('wscdc soap client', () => {
  const validPayload = {
    cbteModo: 'CAE',
    cuitEmisor: '20111111112',
    ptoVta: 1,
    cbteTipo: 1,
    cbteNro: 123,
    cbteFch: '20250131',
    impTotal: 1000.5,
    codAutorizacion: '12345678901234',
    docTipoReceptor: '80',
    docNroReceptor: '30714509566',
    opcionales: [{ id: '99', valor: 'TEST' }],
  };

  it('builds official SOAPAction', () => {
    expect(buildSoapAction(WSCDC_OPERATIONS.dummy)).toBe('http://servicios1.afip.gob.ar/wscdc/ComprobanteDummy');
  });

  it('builds an envelope with WSCDC namespace', () => {
    const xml = buildEnvelope(WSCDC_OPERATIONS.dummy);
    expect(xml).toContain('<ComprobanteDummy xmlns="http://servicios1.afip.gob.ar/wscdc/">');
  });

  it('builds ComprobanteConstatar CmpReq XML', () => {
    const xml = cmpReqXml(validPayload);
    expect(xml).toContain('<CbteModo>CAE</CbteModo>');
    expect(xml).toContain('<CuitEmisor>20111111112</CuitEmisor>');
    expect(xml).toContain('<DocTipoReceptor>80</DocTipoReceptor>');
    expect(xml).toContain('<Opcionales><Opcional>');
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

  it('maps Resultado=A as approved', () => {
    const parsed = parseXml(`<ComprobanteConstatarResult><CmpResp><CbteModo>CAE</CbteModo><CuitEmisor>20111111112</CuitEmisor></CmpResp><Resultado>A</Resultado><FchProceso>20260505120000</FchProceso></ComprobanteConstatarResult>`);
    expect(mapConstatarResponse(parsed)).toMatchObject({
      ok: true,
      verdict: 'approved',
      resultado: 'A',
    });
  });

  it('maps Resultado=A with Observaciones as approved_with_observations', () => {
    const parsed = parseXml(`<ComprobanteConstatarResult><CmpResp><CbteModo>CAE</CbteModo><CuitEmisor>20111111112</CuitEmisor></CmpResp><Resultado>A</Resultado><Observaciones><Obs><Code>10</Code><Msg>Obs</Msg></Obs></Observaciones><FchProceso>20260505120000</FchProceso></ComprobanteConstatarResult>`);
    expect(mapConstatarResponse(parsed)).toMatchObject({
      ok: true,
      verdict: 'approved_with_observations',
      resultado: 'A',
      observaciones: [{ code: 10, msg: 'Obs' }],
    });
  });

  it('maps Resultado=R with Errors as rejected_format', () => {
    const parsed = parseXml(`<ComprobanteConstatarResult><Resultado>R</Resultado><Errors><Err><Code>6</Code><Msg>Fecha invalida</Msg></Err></Errors></ComprobanteConstatarResult>`);
    expect(mapConstatarResponse(parsed)).toMatchObject({
      ok: false,
      verdict: 'rejected_format',
      errors: [{ code: 6, msg: 'Fecha invalida' }],
    });
  });

  it('maps Resultado=R with Observaciones as rejected_business', () => {
    const parsed = parseXml(`<ComprobanteConstatarResult><Resultado>R</Resultado><Observaciones><Obs><Code>100</Code><Msg>No existe</Msg></Obs></Observaciones></ComprobanteConstatarResult>`);
    expect(mapConstatarResponse(parsed)).toMatchObject({
      ok: false,
      verdict: 'rejected_business',
      observaciones: [{ code: 100, msg: 'No existe' }],
    });
  });

  it('posts dummy to configured client', async () => {
    const httpClient = { post: vi.fn().mockResolvedValue({ data: `<ComprobanteDummyResult><AppServer>OK</AppServer><DbServer>OK</DbServer><AuthServer>OK</AuthServer></ComprobanteDummyResult>` }) };
    const client = new WscdcClient({ httpClient, wsaaClient: { getAccessTicket: vi.fn() } });
    await expect(client.dummy()).resolves.toMatchObject({ appserver: 'OK' });
    expect(httpClient.post.mock.calls[0][2].headers.SOAPAction).toBe('http://servicios1.afip.gob.ar/wscdc/ComprobanteDummy');
  });

  it('posts ComprobanteConstatar with Auth and CmpReq', async () => {
    const httpClient = { post: vi.fn().mockResolvedValue({ data: `<ComprobanteConstatarResult><Resultado>A</Resultado></ComprobanteConstatarResult>` }) };
    const wsaaClient = { getAccessTicket: vi.fn().mockResolvedValue({ token: 'tok', sign: 'sig', expirationTime: new Date() }) };
    const client = new WscdcClient({ httpClient, wsaaClient });
    await expect(client.constatar(validPayload)).resolves.toMatchObject({ verdict: 'approved' });

    const [url, envelope, options] = httpClient.post.mock.calls[0];
    expect(url).toContain('/WSCDC/service.asmx');
    expect(envelope).toContain('<ComprobanteConstatar xmlns="http://servicios1.afip.gob.ar/wscdc/">');
    expect(envelope).toContain('<Auth>');
    expect(envelope).toContain('<Token>tok</Token>');
    expect(envelope).toContain('<CmpReq>');
    expect(envelope).toContain('<CodAutorizacion>12345678901234</CodAutorizacion>');
    expect(options.headers.SOAPAction).toBe('http://servicios1.afip.gob.ar/wscdc/ComprobanteConstatar');
  });
});
