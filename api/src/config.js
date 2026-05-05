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
  ?? process.env.WSAA_URL;
const effectiveWsapocUrl = initialEnv.WSAPOC_URL
  ?? (effectiveArcaEnv === 'produccion' ? process.env.ARCA_WSAPOC_PROD_URL : process.env.ARCA_WSAPOC_HOMO_URL)
  ?? process.env.WSAPOC_URL;

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_BASE_PATH: z.string().min(1).default('/api'),
  ARCA_ENV: z.enum(['homologacion', 'produccion']).default('homologacion'),
  ARCA_SERVICE: z.string().min(1).default('wsapoc'),
  ARCA_CUIT_DELEGADO: z.string().regex(/^\d{11}$/),
  WSAA_URL: z.string().url(),
  WSAPOC_URL: z.string().url(),
  WSAPOC_NAMESPACE: z.string().url().default('http://tempuri.org/'),
  ARCA_CERT_PATH: z.string().min(1),
  ARCA_KEY_PATH: z.string().min(1),
  OPENSSL_BIN: z.string().optional().default('openssl'),
  TA_CACHE_DIR: z.string().optional().default('./tmp'),
  TA_RENEW_SKEW_SECONDS: z.coerce.number().int().nonnegative().default(600),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  LOG_LEVEL: z.string().default('info'),
});

function resolveFromRoot(value) {
  return path.isAbsolute(value) ? value : path.resolve(apiRoot, value);
}

const parsed = schema.safeParse({
  ...process.env,
  ARCA_ENV: effectiveArcaEnv,
  WSAA_URL: effectiveWsaaUrl,
  WSAPOC_URL: effectiveWsapocUrl,
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
