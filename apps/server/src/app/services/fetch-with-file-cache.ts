/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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
    create: {
      url: filePath,
      body: data.body,
      headers: data.headers,
      status: String(data.status),
    },
    update: {
      body: data.body,
      headers: data.headers,
      status: String(data.status),
    },
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
 * Создание axios config с прокси
 */
function withProxyConfig(options?: AxiosRequestConfig): AxiosRequestConfig {
  const agent = getProxyAgent();

  return {
    ...options,
    ...(agent
      ? {
          httpAgent: agent,
          httpsAgent: agent,
        }
      : {}),
  };
}

/**
 * ===== AXIOS WRAPPER =====
 */
export const customFetch = async function cachedFetch(url: string, options?: AxiosRequestConfig): Promise<Response> {
  const method = (options?.method || 'GET').toUpperCase();

  const axiosConfig: AxiosRequestConfig = withProxyConfig({
    url,
    method: method as any,
    responseType: 'text', // важно: аналог response.text()
    validateStatus: () => true, // не бросаем на 4xx/5xx
    ...options,
  });

  // Кэшируем только GET
  if (method === 'GET') {
    const cached = await readCache(url);

    if (cached) {
      return new Response(cached.body, {
        status: +(cached.status || 0),
        headers: cached.headers as any,
      });
    }
  }

  const response: AxiosResponse<string> = await axios(axiosConfig);

  if (method === 'GET') {
    await writeCache(url, {
      status: response.status,
      headers: response.headers,
      body: response.data,
    });
  }

  return new Response(response.data, {
    status: response.status,
    headers: response.headers as any,
  });
};
