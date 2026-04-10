/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpsProxyAgent } from 'https-proxy-agent';
import { globalPrismaClient } from './global';
import { globalAppEnvironments } from './global';

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
 * ===== HELPER FUNCTIONS =====
 */

/**
 * Get proxy agent if proxy is configured
 */
function getProxyAgent(): HttpsProxyAgent<string> | undefined {
  const proxyUrl = globalAppEnvironments?.httpProxyUrl;
  if (proxyUrl) {
    return new HttpsProxyAgent(proxyUrl);
  }
  return undefined;
}

/**
 * Merge proxy agent into fetch options
 */
function withProxyOptions(options?: RequestInit): RequestInit {
  const agent = getProxyAgent();
  if (!agent) {
    return options || {};
  }

  return {
    ...options,
    // @ts-expect-error - agent is not in RequestInit but node-fetch supports it
    agent,
  };
}

/**
 * Helper function to apply proxy to raw fetch calls
 * Use this for direct fetch calls that need proxy support
 */
export function fetchWithProxy(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, withProxyOptions(options));
}

/**
 * ===== ПЕРЕОПРЕДЕЛЕНИЕ fetch =====
 */
export const customFetch = async function cachedFetch(url: string, options?: RequestInit | undefined) {
  const method = (options?.method || 'GET').toUpperCase();

  // Apply proxy to all requests
  const proxiedOptions = withProxyOptions(options);

  // Кэшируем только GET
  if (method !== 'GET') {
    return fetch(url, proxiedOptions);
  }

  const cached = await readCache(url);
  if (cached) {
    return new Response(cached.body, {
      status: +(cached.status || 0),
      headers: cached.headers as any,
    });
  }

  const response = await fetch(url, proxiedOptions);
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
