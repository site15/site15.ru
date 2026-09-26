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
 * Тип агента выбирается по схеме ЦЕЛЕВОГО url, а не прокси. HttpsProxyAgent
 * работает и с `http://`, и с `https://` прокси: он шлёт `CONNECT host:port`
 * и поднимает TLS уже внутри туннеля до цели. HttpProxyAgent на https-цели
 * отправляет абсолютную форму `GET http://host:443/…`, которую живые прокси
 * рвут без ответа (ECONNRESET); для plain-http цели наоборот нужен абсолютный
 * forward, а не CONNECT. Проверено на реальном прокси: CONNECT -> 200,
 * absolute-form -> socket hang up.
 */
function getProxyAgent(
  targetUrl: string,
): HttpProxyAgent<string> | HttpsProxyAgent<string> | SocksProxyAgent | undefined {
  const proxyUrl = globalAppEnvironments?.httpProxyUrl;
  if (!proxyUrl) {
    return undefined;
  }
  if (!/^(https?|socks\d?):\/\//i.test(proxyUrl)) {
    console.warn(`SITE_15_HTTP_PROXY_URL has unsupported scheme, proxy is ignored: ${proxyUrl}`);
    return undefined;
  }
  if (/^socks\d?:\/\//i.test(proxyUrl)) {
    return new SocksProxyAgent(proxyUrl);
  }
  if (/^https:\/\//i.test(targetUrl)) {
    return new HttpsProxyAgent(proxyUrl);
  }
  return new HttpProxyAgent(proxyUrl);
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

  const agent = getProxyAgent(options?.url ?? '');

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
