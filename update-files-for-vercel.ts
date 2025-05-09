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

if (!parsedEnvs.SINGLE_SIGN_ON_MINIO_ACCESS_KEY) {
  throw new Error('SINGLE_SIGN_ON_MINIO_ACCESS_KEY not set');
}

if (!parsedEnvs.SINGLE_SIGN_ON_MINIO_SECRET_KEY) {
  throw new Error('SINGLE_SIGN_ON_MINIO_SECRET_KEY not set');
}

// need for apply migrations to supabase
parsedEnvs.SINGLE_SIGN_ON_ROOT_DATABASE_URL = postgresUrl;
parsedEnvs.SINGLE_SIGN_ON_SSO_DATABASE_URL = postgresUrl;
parsedEnvs.SINGLE_SIGN_ON_WEBHOOK_DATABASE_URL = postgresUrl;
parsedEnvs.SINGLE_SIGN_ON_NOTIFICATIONS_DATABASE_URL = postgresUrl;
parsedEnvs.SINGLE_SIGN_ON_TWO_FACTOR_DATABASE_URL = postgresUrl;

parsedEnvs.SINGLE_SIGN_ON_KEYV_URL = postgresUrl.replace('?schema=public', '');

parsedEnvs.SINGLE_SIGN_ON_CLIENT_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
parsedEnvs.SINGLE_SIGN_ON_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
parsedEnvs.SINGLE_SIGN_ON_MINIO_SERVER_HOST = `${supabaseName}.supabase.co`;
parsedEnvs.SINGLE_SIGN_ON_SUPABASE_URL = `https://${supabaseName}.supabase.co`;

parsedEnvs.SINGLE_SIGN_ON_SUPABASE_KEY = supabaseAnonKey;
parsedEnvs.SINGLE_SIGN_ON_DISABLE_SERVE_STATIC = 'true';
parsedEnvs.SINGLE_SIGN_ON_PORT = '3000';

// check real process envs
parsedEnvs.SINGLE_SIGN_ON_SSO_ADMIN_EMAIL =
  process.env.SINGLE_SIGN_ON_SSO_ADMIN_EMAIL || 'nestjs-mod-sso@site15.ru';
parsedEnvs.SINGLE_SIGN_ON_SSO_ADMIN_PASSWORD =
  process.env.SINGLE_SIGN_ON_SSO_ADMIN_PASSWORD ||
  'SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA';
parsedEnvs.SINGLE_SIGN_ON_SSO_ADMIN_USERNAME =
  process.env.SINGLE_SIGN_ON_SSO_ADMIN_USERNAME || 'admin';
parsedEnvs.SINGLE_SIGN_ON_SSO_SERVER_URL =
  process.env.SINGLE_SIGN_ON_SSO_SERVER_URL || 'http://localhost:3000';
parsedEnvs.SINGLE_SIGN_ON_SSO_CLIENT_URL =
  process.env.SINGLE_SIGN_ON_SSO_CLIENT_URL || 'http://localhost:4200';
parsedEnvs.SINGLE_SIGN_ON_SSO_ADMIN_SECRET =
  process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET ||
  'VfKSfPPljhHBXCEohnitursmgDxfAyiD';

parsedEnvs.E2E_CLIENT_URL =
  parsedEnvs.E2E_CLIENT_URL || 'http://localhost:4200';
parsedEnvs.E2E_SERVER_URL =
  parsedEnvs.E2E_SERVER_URL || 'http://localhost:3000';

parsedEnvs.SINGLE_SIGN_ON_SSO_DEFAULT_PUBLIC_PROJECTS =
  process.env.SINGLE_SIGN_ON_SSO_DEFAULT_PUBLIC_PROJECTS ||
  'Beijing:ru=Пекин,Jq6GQ6Rzz6x8HNOD4x2Hc2eM0cfiCVUzGfsi,X6nk0OZXQJboSEfugnH35e9oSeg5RFlV0DQprtYyYDQjNli9mA;Moscow:ru=Москва,OceX08HGZ89PTkPpg9KDk5ErY1uMfDcfFKkw,VJztpDIwvqG6IkTVEIDEw1Ed2Wu5oHu6zfBe7CCJFrCtyWO2Yv;New York:ru=Нью-Йорк,4OGD25Rmn3W3MP0kMd7c90rGP1WwK8u4wL1w,qm8nc9MgKyvd6Hgl3jY5BjgDFSBqNvxcu6o52kDjIC168OsM1R;';

parsedEnvs.SINGLE_SIGN_ON_SSO_DEFAULT_PROJECT =
  process.env.SINGLE_SIGN_ON_SSO_DEFAULT_PROJECT ||
  'default:ru=по умолчанию,KzMRNEZTetzatIgQPVSDYfeGyaZrbLzkcxNc,qaHkVpAtUVIpDdLXMlAOzsBfMRJblWoHpXguYQRBuSEBpGKbWt';

writeFileSync(
  join(__dirname, 'apps/client/src/environments/environment.supabase-prod.ts'),
  `export const serverUrl = '';
export const minioURL =
  'https://${supabaseName}.supabase.co/storage/v1/s3';
export const supabaseURL = 'https://${supabaseName}.supabase.co';
export const supabaseKey =
  '${supabaseAnonKey}';
`
);
writeFileSync(
  join(__dirname, 'apps/client/src/environments/environment.supabase.ts'),
  `export const serverUrl = 'http://localhost:3000';
export const minioURL =
  'https://${supabaseName}.supabase.co/storage/v1/s3';
export const supabaseURL = 'https://${supabaseName}.supabase.co';
export const supabaseKey =
  '${supabaseAnonKey}';
`
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
    if (
      value &&
      (value.includes('*') ||
        value.includes('!') ||
        value.includes('$') ||
        value.includes(' '))
    ) {
      if (value.includes("'")) {
        return `${key}='${value.split("'").join("\\'")}'`;
      }
      return `${key}='${value}'`;
    }
    return `${key}=${value}`;
  })
  .join('\n');

writeFileSync(envFile, envContent);
