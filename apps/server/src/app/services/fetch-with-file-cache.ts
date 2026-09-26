/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
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
 * Get proxy agent if proxy is configured.
 *
 * Тип агента выбирается по схеме самого прокси, а не по схеме целевого URL:
 * http-прокси (`http://host:3128`, самый частый вариант) нужно коннектить
 * через HttpProxyAgent, иначе HttpsProxyAgent пытается поднять TLS до
 * plaintext-портом прокси и запрос падает с "Client network socket
 * disconnected before secure TLS connection was established".
 */
function getProxyAgent(): HttpProxyAgent<string> | HttpsProxyAgent<string> | SocksProxyAgent | undefined {
  const proxyUrl = globalAppEnvironments?.httpProxyUrl;
  if (!proxyUrl) {
    return undefined;
  }
  if (/^socks\d??:\/\//i.test(proxyUrl)) {
    return new SocksProxyAgent(proxyUrl);
  }
  if (/^https:\/\//i.test(proxyUrl)) {
    return new HttpsProxyAgent(proxyUrl);
  }
  if (/^http:\/\//i.test(proxyUrl)) {
    return new HttpProxyAgent(proxyUrl);
  }
  console.warn(`SITE_15_HTTP_PROXY_URL has unsupported scheme, proxy is ignored: ${proxyUrl}`);
  return undefined;
}

/**
 * Создание axios config с прокси
 *
 * `proxy: false` в options — явный отказ от прокси (то же значение понимает
 * сам axios). Нужно для площадок, которые доступны напрямую: после включения
 * SITE_15_HTTP_PROXY_URL они уехали бы на зарубежный IP и рискули бы отдать
 * 403/троттлинг вместо данных.
 */
function withProxyConfig(options?: AxiosRequestConfig): AxiosRequestConfig {
  if (options?.proxy === false) {
    return { ...options };
  }

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
export const customFetch = async function cachedFetch(
  url: string,
  options?: AxiosRequestConfig,
  skipCache?: boolean,
): Promise<Response> {
  const method = (options?.method || 'GET').toUpperCase();

  const axiosConfig: AxiosRequestConfig = withProxyConfig({
    url,
    method: method as any,
    responseType: 'text', // важно: аналог response.text()
    validateStatus: () => true, // не бросаем на 4xx/5xx
    ...options,
  });

  // Кэшируем только GET
  if (method === 'GET' && !skipCache) {
    const cached = await readCache(url);

    if (cached) {
      return new Response(cached.body, {
        status: +(cached.status || 0),
        headers: cached.headers as any,
      });
    }
  }

  const response: AxiosResponse<string> = await axios(axiosConfig);

  if (method === 'GET' && !skipCache) {
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
