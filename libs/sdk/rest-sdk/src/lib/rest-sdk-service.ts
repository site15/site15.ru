import axios, { AxiosInstance } from 'axios';
import { Observable, finalize } from 'rxjs';

import WebSocket from 'ws';
import { Configuration, SsoApi, TimeApi, MetricsApi } from './generated';

export class Site15RestSdkService {
  private ssoApi?: SsoApi;
  private timeApi?: TimeApi;
  private metricsApi?: MetricsApi;

  private timeApiAxios?: AxiosInstance;
  private ssoApiAxios?: AxiosInstance;
  private metricsApiAxios?: AxiosInstance;

  private wsHeaders: Record<string, string> = {};

  constructor(
    private options?: {
      serverUrl?: string;
      headers?: Record<string, string>;
    },
  ) {
    this.createApiClients();
    this.updateHeaders(options?.headers || {});
  }

  getTimeApi() {
    if (!this.timeApi) {
      throw new Error('timeApi not set');
    }
    return this.timeApi;
  }

  getSsoApi() {
    if (!this.ssoApi) {
      throw new Error('ssoApi not set');
    }
    return this.ssoApi;
  }

  getMetricsApi() {
    if (!this.metricsApi) {
      throw new Error('metricsApi not set');
    }
    return this.metricsApi;
  }

  updateHeaders(headers: Record<string, string>) {
    Object.assign(this.wsHeaders, headers);

    if (this.ssoApiAxios) {
      Object.assign(this.ssoApiAxios.defaults.headers.common, headers);
    }
    if (this.timeApiAxios) {
      Object.assign(this.timeApiAxios.defaults.headers.common, headers);
    }
    if (this.metricsApiAxios) {
      Object.assign(this.metricsApiAxios.defaults.headers.common, headers);
    }
  }

  webSocket<T>({ path, eventName, options }: { path: string; eventName: string; options?: WebSocket.ClientOptions }) {
    const wss = new WebSocket(this.options?.serverUrl?.replace('/api', '').replace('http', 'ws') + path, {
      ...(options || {}),
      headers: this.wsHeaders || {},
    });
    return new Observable<{ data: T; event: string }>((observer) => {
      wss.on('open', () => {
        wss.on('message', (data) => {
          observer.next(JSON.parse(data.toString()));
        });
        wss.on('error', (err) => {
          observer.error(err);
          if (wss?.readyState == WebSocket.OPEN) {
            wss.close();
          }
        });
        wss.send(
          JSON.stringify({
            event: eventName,
            data: true,
          }),
        );
      });
    }).pipe(
      finalize(() => {
        if (wss?.readyState == WebSocket.OPEN) {
          wss.close();
        }
      }),
    );
  }

  private createApiClients() {
    this.ssoApiAxios = axios.create();
    this.ssoApi = new SsoApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.ssoApiAxios,
    );

    this.timeApiAxios = axios.create();
    this.timeApi = new TimeApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.timeApiAxios,
    );

    this.metricsApiAxios = axios.create();
    this.metricsApi = new MetricsApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.metricsApiAxios,
    );
  }
}
