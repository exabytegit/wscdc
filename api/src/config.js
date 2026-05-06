import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');
const initialEnv = { ...process.env };

dotenv.config({ path: path.join(apiRoot, '.env') });

if ((initialEnv.NODE_ENV ?? process.env.NODE_ENV) === 'production') {
  const productionEnv = dotenv.config({ path: path.join(apiRoot, '.env.production') }).parsed ?? {};
  for (const [key, value] of Object.entries(productionEnv)) {
    if (initialEnv[key] === undefined) process.env[key] = value;
  }
}

function resolveArcaEnv() {
  if (initialEnv.ARCA_ENV) return initialEnv.ARCA_ENV;
  if (process.env.ARCA_ENV && process.env.ARCA_ENV !== 'homologacion') return process.env.ARCA_ENV;
  if ((initialEnv.NODE_ENV ?? process.env.NODE_ENV) === 'production') return 'produccion';
  return process.env.ARCA_ENV || 'homologacion';
}

const effectiveArcaEnv = resolveArcaEnv();
const effectiveWsaaUrl = initialEnv.WSAA_URL
  ?? (effectiveArcaEnv === 'produccion' ? process.env.ARCA_WSAA_PROD_URL : process.env.ARCA_WSAA_HOMO_URL)
  ?? process.env.WSAA_URL
  ?? (effectiveArcaEnv === 'produccion' ? 'https://wsaa.afip.gov.ar/ws/services/LoginCms' : 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms');
const effectiveWscdcUrl = initialEnv.WSCDC_URL
  ?? (effectiveArcaEnv === 'produccion' ? process.env.ARCA_WSCDC_PROD_URL : process.env.ARCA_WSCDC_HOMO_URL)
  ?? process.env.WSCDC_URL
  ?? (effectiveArcaEnv === 'produccion' ? 'https://servicios1.afip.gov.ar/WSCDC/service.asmx' : 'https://wswhomo.afip.gob.ar/WSCDC/service.asmx');
const effectiveWscdcNamespace = initialEnv.WSCDC_NAMESPACE
  ?? process.env.ARCA_WSCDC_NAMESPACE
  ?? process.env.WSCDC_NAMESPACE
  ?? 'http://servicios1.afip.gob.ar/wscdc/';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3002),
  API_BASE_PATH: z.string().min(1).default('/api'),
  ARCA_ENV: z.enum(['homologacion', 'produccion']).default('homologacion'),
  ARCA_SERVICE: z.string().min(1).default('wscdc'),
  ARCA_CUIT: z.string().regex(/^\d{11}$/).or(z.literal('')).default(''),
  WSAA_URL: z.string().url(),
  WSCDC_URL: z.string().url(),
  WSCDC_NAMESPACE: z.string().url().default('http://servicios1.afip.gob.ar/wscdc/'),
  ARCA_CERT_PATH: z.string().default(''),
  ARCA_KEY_PATH: z.string().default(''),
  OPENSSL_BIN: z.string().optional().default('openssl'),
  TA_CACHE_DIR: z.string().optional().default('./tmp'),
  TA_RENEW_SKEW_SECONDS: z.coerce.number().int().nonnegative().default(600),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  CORS_ORIGIN: z.string().default('http://127.0.0.1:5501'),
  LOG_LEVEL: z.string().default('info'),
});

function resolveFromRoot(value) {
  if (!value) return '';
  return path.isAbsolute(value) ? value : path.resolve(apiRoot, value);
}

const parsed = schema.safeParse({
  ...process.env,
  ARCA_ENV: effectiveArcaEnv,
  WSAA_URL: effectiveWsaaUrl,
  WSCDC_URL: effectiveWscdcUrl,
  WSCDC_NAMESPACE: effectiveWscdcNamespace,
});

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Configuracion invalida: ${details}`);
}

export const config = {
  ...parsed.data,
  API_ROOT: apiRoot,
  ARCA_CERT_PATH: resolveFromRoot(parsed.data.ARCA_CERT_PATH),
  ARCA_KEY_PATH: resolveFromRoot(parsed.data.ARCA_KEY_PATH),
  OPENSSL_BIN: parsed.data.OPENSSL_BIN || 'openssl',
  TA_CACHE_DIR: resolveFromRoot(parsed.data.TA_CACHE_DIR || './tmp'),
};
