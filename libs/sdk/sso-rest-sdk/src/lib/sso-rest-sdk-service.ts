import axios, { AxiosInstance } from 'axios';
import { Observable, finalize } from 'rxjs';

import { FilesRestSdkService } from '@nestjs-mod/files';
import { NotificationsRestSdkService } from '@nestjs-mod/notifications';
import { WebhookRestSdkService } from '@nestjs-mod/webhook';
import WebSocket from 'ws';
import { Configuration, SsoApi, TimeApi } from './generated';

export class SsoRestSdkService {
  private ssoApi?: SsoApi;
  private timeApi?: TimeApi;

  private timeApiAxios?: AxiosInstance;
  private ssoApiAxios?: AxiosInstance;

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

  updateHeaders(headers: Record<string, string>) {
    Object.assign(this.wsHeaders, headers);

    if (this.ssoApiAxios) {
      Object.assign(this.ssoApiAxios.defaults.headers.common, headers);
    }
    if (this.timeApiAxios) {
      Object.assign(this.timeApiAxios.defaults.headers.common, headers);
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
    this.ssoApiAxios = axios.create();
    this.ssoApi = new SsoApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.ssoApiAxios
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
  }
}
