import { get } from 'env-var';

export function getUrls() {
  return {
    serverUrl: get('E2E_SERVER_URL').required().asString(),
    minioUrl: get('SINGLE_SIGN_ON_MINIO_URL').required().asString(),
  };
}
