import axios, { AxiosInstance } from 'axios';
import { Observable, finalize } from 'rxjs';

import WebSocket from 'ws';
import {
  Configuration,
  FilesApi,
  NotificationsApi,
  SsoApi,
  TimeApi,
  WebhookApi,
} from './generated';

export class RestSdkService {
  private ssoApi?: SsoApi;
  private webhookApi?: WebhookApi;
  private filesApi?: FilesApi;
  private timeApi?: TimeApi;
  private notificationsApi?: NotificationsApi;

  private webhookApiAxios?: AxiosInstance;
  private filesApiAxios?: AxiosInstance;
  private timeApiAxios?: AxiosInstance;
  private ssoApiAxios?: AxiosInstance;
  private notificationsApiAxios?: AxiosInstance;

  private wsHeaders: Record<string, string> = {};

  constructor(
    private options?: {
      serverUrl?: string;
      headers?: Record<string, string>;
    }
  ) {
    this.createApiClients();
    this.updateHeaders(options?.headers || {});
  }

  getWebhookApi() {
    if (!this.webhookApi) {
      throw new Error('webhookApi not set');
    }
    return this.webhookApi;
  }

  getFilesApi() {
    if (!this.filesApi) {
      throw new Error('filesApi not set');
    }
    return this.filesApi;
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

  getNotificationsApi() {
    if (!this.notificationsApi) {
      throw new Error('notificationsApi not set');
    }
    return this.notificationsApi;
  }

  updateHeaders(headers: Record<string, string>) {
    Object.assign(this.wsHeaders, headers);

    if (this.webhookApiAxios) {
      Object.assign(this.webhookApiAxios.defaults.headers.common, headers);
    }
    if (this.ssoApiAxios) {
      Object.assign(this.ssoApiAxios.defaults.headers.common, headers);
    }
    if (this.filesApiAxios) {
      Object.assign(this.filesApiAxios.defaults.headers.common, headers);
    }
    if (this.ssoApiAxios) {
      Object.assign(this.ssoApiAxios.defaults.headers.common, headers);
    }
    if (this.timeApiAxios) {
      Object.assign(this.timeApiAxios.defaults.headers.common, headers);
    }
    if (this.notificationsApiAxios) {
      Object.assign(
        this.notificationsApiAxios.defaults.headers.common,
        headers
      );
    }
  }

  webSocket<T>({
    path,
    eventName,
    options,
  }: {
    path: string;
    eventName: string;
    options?: WebSocket.ClientOptions;
  }) {
    const wss = new WebSocket(
      this.options?.serverUrl?.replace('/api', '').replace('http', 'ws') + path,
      {
        ...(options || {}),
        headers: this.wsHeaders || {},
      }
    );
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
          })
        );
      });
    }).pipe(
      finalize(() => {
        if (wss?.readyState == WebSocket.OPEN) {
          wss.close();
        }
      })
    );
  }

  private createApiClients() {
    this.webhookApiAxios = axios.create();
    this.webhookApi = new WebhookApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.webhookApiAxios
    );
    //

    this.ssoApiAxios = axios.create();
    this.ssoApi = new SsoApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.ssoApiAxios
    );
    //

    this.filesApiAxios = axios.create();
    this.filesApi = new FilesApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.filesApiAxios
    );
    //

    this.timeApiAxios = axios.create();
    this.timeApi = new TimeApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.timeApiAxios
    );
    //

    this.ssoApiAxios = axios.create();
    this.ssoApi = new SsoApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.ssoApiAxios
    );
    //

    this.notificationsApiAxios = axios.create();
    this.notificationsApi = new NotificationsApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.notificationsApiAxios
    );
  }
}
