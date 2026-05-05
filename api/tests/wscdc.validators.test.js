import { describe, expect, it } from 'vitest';
import { validateConstatarPayload } from '../src/services/wscdc/wscdc.validators.js';

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
  opcionales: [],
};

describe('wscdc validators', () => {
  it('normalizes a valid constatar payload', () => {
    expect(validateConstatarPayload(validPayload)).toMatchObject({
      cbteModo: 'CAE',
      cuitEmisor: '20111111112',
      ptoVta: 1,
      impTotal: 1000.5,
    });
  });

  it('rejects invalid modality', () => {
    expect(() => validateConstatarPayload({ ...validPayload, cbteModo: 'OTRO' })).toThrow(/CbteModo/);
  });

  it('rejects invalid yyyymmdd dates', () => {
    expect(() => validateConstatarPayload({ ...validPayload, cbteFch: '20250231' })).toThrow(/CbteFch/);
  });

  it('requires both receptor document fields when one is present', () => {
    expect(() => validateConstatarPayload({ ...validPayload, docTipoReceptor: '80', docNroReceptor: '' })).toThrow(/documento receptor/);
  });
});
