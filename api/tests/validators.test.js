import { describe, expect, it } from 'vitest';
import { paginate, validateCuit, validateDateRange } from '../src/validators.js';

describe('validators', () => {
  it('accepts a valid CUIT', () => {
    expect(validateCuit('20-11111111-2')).toBe('20111111112');
  });

  it('rejects an invalid CUIT verification digit', () => {
    expect(() => validateCuit('20111111113')).toThrow('CUIT ingresado no es valido');
  });

  it('accepts a valid date range with pagination defaults', () => {
    expect(validateDateRange({ desde: '01/01/2026', hasta: '31/01/2026' })).toEqual({
      desde: '01/01/2026',
      hasta: '31/01/2026',
      page: 1,
      pageSize: 10,
    });
  });

  it('rejects ranges longer than 365 days', () => {
    expect(() => validateDateRange({ desde: '01/01/2025', hasta: '02/01/2026' })).toThrow('365 dias');
  });

  it('paginates result arrays', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual({
      items: [3, 4],
      total: 5,
      page: 2,
      pageSize: 2,
      totalPages: 3,
    });
  });
});
