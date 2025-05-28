import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function replaceEnvs() {
  const clientBrowserPath = join(__dirname, '..', 'client', 'browser');
  if (existsSync(clientBrowserPath)) {
    const files = readdirSync(clientBrowserPath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const fullFilePath = join(clientBrowserPath, file);
        const content = readFileSync(fullFilePath).toString();
        writeFileSync(
          fullFilePath,
          content.replace(
            new RegExp('___SINGLE_SIGN_ON_CLIENT_MINIO_URL___', 'g'),
            process.env.SINGLE_SIGN_ON_CLIENT_MINIO_URL ||
              'http://localhost:9000'
          )
        );
      }
    }
  }
}

export const fake = 'fake';
