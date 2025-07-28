import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const envFile = join(__dirname, '.env');
const processEnv = {};
const parsedEnvs = config({ path: envFile, processEnv }).parsed || {};
const supabaseUrl = parsedEnvs.SUPABASE_URL;
const postgresUrl = parsedEnvs.POSTGRES_URL;
const supabaseAnonKey = parsedEnvs.SUPABASE_ANON_KEY;
const supabaseName = supabaseUrl?.split('//')[1].split('.')[0];

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL not set');
}

if (!postgresUrl) {
  throw new Error('POSTGRES_URL not set');
}

if (!supabaseName) {
  throw new Error('supabaseName not set');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY not set');
}

if (!parsedEnvs.SITE_15_MINIO_ACCESS_KEY) {
  throw new Error('SITE_15_MINIO_ACCESS_KEY not set');
}

if (!parsedEnvs.SITE_15_MINIO_SECRET_KEY) {
  throw new Error('SITE_15_MINIO_SECRET_KEY not set');
}

// need for apply migrations to supabase
parsedEnvs.SITE_15_ROOT_DATABASE_URL = postgresUrl;
parsedEnvs.SITE_15_SSO_DATABASE_URL = postgresUrl;
parsedEnvs.SITE_15_METRICS_DATABASE_URL = postgresUrl;
parsedEnvs.SITE_15_WEBHOOK_DATABASE_URL = postgresUrl;
parsedEnvs.SITE_15_NOTIFICATIONS_DATABASE_URL = postgresUrl;
parsedEnvs.SITE_15_TWO_FACTOR_DATABASE_URL = postgresUrl;

parsedEnvs.SITE_15_KEYV_URL = postgresUrl.replace('?schema=public', '');

parsedEnvs.SITE_15_CLIENT_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
parsedEnvs.SITE_15_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
parsedEnvs.SITE_15_MINIO_SERVER_HOST = `${supabaseName}.supabase.co`;
parsedEnvs.SITE_15_SUPABASE_URL = `https://${supabaseName}.supabase.co`;

parsedEnvs.SITE_15_SUPABASE_KEY = supabaseAnonKey;
parsedEnvs.SITE_15_DISABLE_SERVE_STATIC = 'true';
parsedEnvs.SITE_15_PORT = '3000';

// check real process envs
parsedEnvs.SITE_15_SSO_ADMIN_EMAIL = process.env.SITE_15_SSO_ADMIN_EMAIL || 'admin@site15.ru';
parsedEnvs.SITE_15_SSO_ADMIN_PASSWORD = process.env.SITE_15_SSO_ADMIN_PASSWORD || 'SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA';
parsedEnvs.SITE_15_SSO_ADMIN_USERNAME = process.env.SITE_15_SSO_ADMIN_USERNAME || 'admin';
parsedEnvs.SITE_15_SSO_SERVER_URL = process.env.SITE_15_SSO_SERVER_URL || 'http://localhost:3000';
parsedEnvs.SITE_15_SSO_CLIENT_URL = process.env.SITE_15_SSO_CLIENT_URL || 'http://localhost:4200';
parsedEnvs.SITE_15_SSO_ADMIN_SECRET = process.env.SITE_15_SSO_ADMIN_SECRET || 'VfKSfPPljhHBXCEohnitursmgDxfAyiD';

parsedEnvs.E2E_CLIENT_URL = parsedEnvs.E2E_CLIENT_URL || 'http://localhost:4200';
parsedEnvs.E2E_SERVER_URL = parsedEnvs.E2E_SERVER_URL || 'http://localhost:3000';

parsedEnvs.SITE_15_SSO_DEFAULT_PUBLIC_PROJECTS = process.env.SITE_15_SSO_DEFAULT_PUBLIC_PROJECTS || '';
parsedEnvs.SITE_15_SSO_DEFAULT_PROJECT =
  process.env.SITE_15_SSO_DEFAULT_PROJECT ||
  'default:ru=по умолчанию,KzMRNEZTetzatIgQPVSDYfeGyaZrbLzkcxNc,qaHkVpAtUVIpDdLXMlAOzsBfMRJblWoHpXguYQRBuSEBpGKbWt';

writeFileSync(
  join(__dirname, 'apps/client/src/environments/environment.supabase-prod.ts'),
  `export const serverUrl = '';
export const minioURL =
  'https://${supabaseName}.supabase.co/storage/v1/s3';
export const supabaseURL = 'https://${supabaseName}.supabase.co';
export const supabaseKey =
  '${supabaseAnonKey}';
`,
);
writeFileSync(
  join(__dirname, 'apps/client/src/environments/environment.supabase.ts'),
  `export const serverUrl = 'http://localhost:3000';
export const minioURL =
  'https://${supabaseName}.supabase.co/storage/v1/s3';
export const supabaseURL = 'https://${supabaseName}.supabase.co';
export const supabaseKey =
  '${supabaseAnonKey}';
`,
);

const envContent = Object.entries(parsedEnvs)
  .filter(([key]) => !key.startsWith('TURBO') && !key.startsWith('VERCEL'))
  .map(([key, value]) => {
    if (key.trim().startsWith('#')) {
      return `${key}${value ? value : ''}`;
    }
    if (value !== undefined && value !== null && !isNaN(+value)) {
      return `${key}=${value}`;
    }
    if (value && (value.includes('*') || value.includes('!') || value.includes('$') || value.includes(' '))) {
      if (value.includes("'")) {
        return `${key}='${value.split("'").join("\\'")}'`;
      }
      return `${key}='${value}'`;
    }
    return `${key}=${value}`;
  })
  .join('\n');

writeFileSync(envFile, envContent);
