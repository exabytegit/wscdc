import { z } from 'zod';
import { ApiError } from './errors.js';
import { parseDDMMYYYY } from './utils/date.js';

export function validateCuit(value) {
  const cleaned = String(value || '').replace(/[-\s]/g, '');

  if (!/^\d{11}$/.test(cleaned)) {
    throw new ApiError({ status: 400, codigo: 200, descripcion: 'El CUIT debe tener 11 digitos numericos.', scenario: 'VALIDATION_ERROR' });
  }

  const validPrefixes = ['20', '23', '24', '25', '26', '27', '30', '33', '34'];
  if (!validPrefixes.includes(cleaned.slice(0, 2))) {
    throw new ApiError({ status: 400, codigo: 200, descripcion: 'El prefijo del CUIT no es valido.', scenario: 'VALIDATION_ERROR' });
  }

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = multipliers.reduce((acc, multiplier, index) => acc + Number(cleaned[index]) * multiplier, 0);
  const remainder = sum % 11;
  const expectedDigit = remainder === 0 ? 0 : 11 - remainder;

  if (expectedDigit === 10 || Number(cleaned[10]) !== expectedDigit) {
    throw new ApiError({ status: 400, codigo: 200, descripcion: 'El CUIT ingresado no es valido.', scenario: 'VALIDATION_ERROR' });
  }

  return cleaned;
}

export function validateDateRange(query) {
  const schema = z.object({
    desde: z.string(),
    hasta: z.string(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  });
  const parsed = schema.safeParse(query);

  if (!parsed.success) {
    throw new ApiError({ status: 400, codigo: 200, descripcion: 'Parametros de rango invalidos.', scenario: 'VALIDATION_ERROR' });
  }

  const desdeDate = parseDDMMYYYY(parsed.data.desde);
  const hastaDate = parseDDMMYYYY(parsed.data.hasta);

  if (!desdeDate || !hastaDate) {
    throw new ApiError({ status: 400, codigo: 200, descripcion: 'Las fechas deben tener formato DD/MM/YYYY.', scenario: 'VALIDATION_ERROR' });
  }

  if (desdeDate > hastaDate) {
    throw new ApiError({ status: 400, codigo: 200, descripcion: 'La fecha desde no puede ser posterior a la fecha hasta.', scenario: 'VALIDATION_ERROR' });
  }

  const days = (hastaDate - desdeDate) / (1000 * 60 * 60 * 24);
  if (days > 365) {
    throw new ApiError({ status: 400, codigo: 200, descripcion: 'El rango no puede superar los 365 dias.', scenario: 'VALIDATION_ERROR' });
  }

  return parsed.data;
}

export function paginate(items, page, pageSize) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  return {
    items: paged,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
