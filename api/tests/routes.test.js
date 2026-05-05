import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { ApiError } from '../src/errors.js';

function appWith(client) {
  return createApp({ wscdcClient: client });
}

const validPayload = {
  cbteModo: 'CAE',
  cuitEmisor: '20111111112',
  ptoVta: 1,
  cbteTipo: 1,
  cbteNro: 123,
  cbteFch: '20250131',
  impTotal: 1000.5,
  codAutorizacion: '12345678901234',
};

describe('api routes', () => {
  it('GET /api/health returns dummy status', async () => {
    const app = appWith({
      dummy: vi.fn().mockResolvedValue({ appserver: 'OK', dbserver: 'OK', authserver: 'OK' }),
    });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      service: 'wscdc',
      status: 'operational',
      appserver: 'OK',
      dbserver: 'OK',
      authserver: 'OK',
    });
  });

  it('GET /api/health exposes degraded status', async () => {
    const app = appWith({
      dummy: vi.fn().mockResolvedValue({ appserver: 'OK', dbserver: 'OK', authserver: 'NO' }),
    });

    const res = await request(app).get('/api/health');

    expect(res.body.status).toBe('degraded');
  });

  it('GET /api/wscdc/catalogos/modalidades returns normalized catalog', async () => {
    const app = appWith({
      catalog: vi.fn().mockResolvedValue({
        items: [{ id: 'CAE', descripcion: 'Comprobante electronico' }],
        errors: [],
        events: [],
      }),
    });

    const res = await request(app).get('/api/wscdc/catalogos/modalidades?refresh=1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      service: 'wscdc',
      items: [{ id: 'CAE', descripcion: 'Comprobante electronico' }],
    });
  });

  it('POST /api/wscdc/constatar returns normalized constatar response', async () => {
    const app = appWith({
      constatar: vi.fn().mockResolvedValue({
        ok: true,
        verdict: 'approved',
        resultado: 'A',
        observaciones: [],
        errors: [],
        events: [],
      }),
    });

    const res = await request(app).post('/api/wscdc/constatar').send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      service: 'wscdc',
      verdict: 'approved',
      resultado: 'A',
    });
  });

  it('POST /api/wscdc/constatar invalid payload returns validation error', async () => {
    const app = appWith({
      constatar: vi.fn().mockRejectedValue(new ApiError({
        status: 400,
        codigo: 200,
        descripcion: 'CbteModo debe ser CAE, CAEA o CAI.',
        scenario: 'VALIDATION_ERROR',
      })),
    });

    const res = await request(app).post('/api/wscdc/constatar').send({ ...validPayload, cbteModo: 'X' });

    expect(res.status).toBe(400);
    expect(res.body.scenario).toBe('VALIDATION_ERROR');
  });
});
