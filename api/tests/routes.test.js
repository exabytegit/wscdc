import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { ApiError } from '../src/errors.js';

function appWith(client) {
  return createApp({ wsapocClient: client });
}

describe('api routes', () => {
  it('GET /api/health returns dummy status', async () => {
    const app = appWith({
      dummy: vi.fn().mockResolvedValue({ appserver: 'OK', dbserver: 'OK', authserver: 'OK' }),
    });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      service: 'wsapoc',
      status: 'operational',
      appserver: 'OK',
      dbserver: 'OK',
      authserver: 'OK',
    });
    expect(['homologacion', 'produccion']).toContain(res.body.arcaEnv);
  });

  it('GET /api/health exposes degraded status when authserver is unavailable', async () => {
    const app = appWith({
      dummy: vi.fn().mockResolvedValue({ appserver: 'OK', dbserver: 'OK', authserver: 'NO' }),
    });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      service: 'wsapoc',
      status: 'degraded',
      appserver: 'OK',
      dbserver: 'OK',
      authserver: 'NO',
    });
    expect(['homologacion', 'produccion']).toContain(res.body.arcaEnv);
  });

  it('GET /api/consulta/cuit/:cuit returns one result', async () => {
    const app = appWith({
      getPublicacionApoc: vi.fn().mockResolvedValue({
        codigo: 0,
        descripcion: 'Ejecucion exitosa.',
        resultado: { CUIT: '20111111112', Descripcion: 'TEST', FechaCondicion: '01/01/2026', FechaPublicacion: '02/01/2026' },
      }),
    });

    const res = await request(app).get('/api/consulta/cuit/20111111112');

    expect(res.status).toBe(200);
    expect(res.body.resultado.CUIT).toBe('20111111112');
  });

  it('GET /api/consulta/cuit/:cuit rejects invalid CUITs', async () => {
    const app = appWith({ getPublicacionApoc: vi.fn() });

    const res = await request(app).get('/api/consulta/cuit/20111111113');

    expect(res.status).toBe(400);
    expect(res.body.codigo).toBe(200);
    expect(res.body.scenario).toBe('VALIDATION_ERROR');
  });

  it('GET /api/consulta/rango returns paginated items', async () => {
    const app = appWith({
      getAllByPublicacion: vi.fn().mockResolvedValue({
        codigo: 0,
        descripcion: 'Ejecucion exitosa.',
        items: [
          { CUIT: '20111111112' },
          { CUIT: '27222222224' },
          { CUIT: '30333333339' },
        ],
      }),
    });

    const res = await request(app).get('/api/consulta/rango?desde=01/01/2026&hasta=31/01/2026&page=2&pageSize=2');

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([{ CUIT: '30333333339' }]);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(2);
  });

  it('maps SOAP faults to normalized errors', async () => {
    const app = appWith({
      dummy: vi.fn().mockRejectedValue(new ApiError({ status: 502, descripcion: 'SOAP fault', scenario: 'SOAP_FAULT' })),
    });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(502);
    expect(res.body.scenario).toBe('SOAP_FAULT');
    expect(res.body.requestId).toBeTruthy();
  });
});
