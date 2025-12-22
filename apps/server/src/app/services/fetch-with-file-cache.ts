/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalPrismaClient } from './global';

/**
 * ===== НАСТРОЙКИ =====
 */
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 1 день

/**
 * Чтение кэша
 */
async function readCache(filePath: string) {
  try {
    const cached = await globalPrismaClient.metricsDynamicCache.findFirst({
      where: { url: filePath },
    });

    if (cached && Date.now() > +cached.createdAt + CACHE_TTL_MS) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

/**
 * Запись кэша
 */
async function writeCache(
  filePath: string,
  data: {
    status: number;
    headers: any;
    body: any;
  },
) {
  await globalPrismaClient.metricsDynamicCache.upsert({
    create: { url: filePath, body: data.body, headers: data.headers, status: String(data.status) },
    update: { body: data.body, headers: data.headers, status: String(data.status) },
    where: { url: filePath },
  });
}

/**
 * ===== ПЕРЕОПРЕДЕЛЕНИЕ fetch =====
 */
export const customFetch = async function cachedFetch(url: string, options?: RequestInit | undefined) {
  const method = (options?.method || 'GET').toUpperCase();

  // Кэшируем только GET
  if (method !== 'GET') {
    return fetch(url, options);
  }

  const cached = await readCache(url);
  if (cached) {
    return new Response(cached.body, {
      status: +(cached.status || 0),
      headers: cached.headers as any,
    });
  }

  const response = await fetch(url, options);
  const body = await response.text();

  await writeCache(url, {
    status: response.status,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: Object.fromEntries((response.headers as any).entries()),
    body,
  });

  return new Response(body, {
    status: response.status,
    headers: response.headers,
  });
};
