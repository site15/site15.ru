import { get } from 'env-var';

export function getUrls() {
  return {
    serverUrl: get('SERVER_URL').required().asString(),
    minioUrl: get('SERVER_MINIO_URL').required().asString(),
  };
}
