import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function replaceEnvs() {
  const files = readdirSync(join(__dirname, '..', 'client', 'browser'));
  for (const file of files) {
    if (file.endsWith('.js')) {
      const fullFilePath = join(__dirname, '..', 'client', 'browser', file);
      const content = readFileSync(fullFilePath).toString();
      writeFileSync(
        fullFilePath,
        content.replace(
          new RegExp('___CLIENT_MINIO_URL___', 'g'),
          process.env.CLIENT_MINIO_URL || 'http://localhost:9000'
        )
      );
    }
  }
}
