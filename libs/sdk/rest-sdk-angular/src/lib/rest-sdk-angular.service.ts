import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import {
  FilesRestService,
  NotificationsRestService,
  RestClientConfiguration,
  SsoRestService,
  TimeRestService,
  WebhookRestService,
} from './generated';

@Injectable({ providedIn: 'root' })
export class RestSdkAngularService {
  constructor(
    private readonly restClientConfiguration: RestClientConfiguration,
    private readonly webhookRestService: WebhookRestService,
    private readonly timeRestService: TimeRestService,
    private readonly filesRestService: FilesRestService,
    private readonly ssoRestService: SsoRestService,
    private readonly notificationsRestService: NotificationsRestService
  ) {
    ssoRestService.configuration.withCredentials = true;
  }

  getWebhookApi() {
    if (!this.webhookRestService) {
      throw new Error('webhookRestService not set');
    }
    return this.webhookRestService;
  }

  getFilesApi() {
    if (!this.filesRestService) {
      throw new Error('filesRestService not set');
    }
    return this.filesRestService;
  }

  getTimeApi() {
    if (!this.timeRestService) {
      throw new Error('timeRestService not set');
    }
    return this.timeRestService;
  }

  getSsoApi() {
    if (!this.ssoRestService) {
      throw new Error('ssoApi not set');
    }
    return this.ssoRestService;
  }

  getNotificationsApi() {
    if (!this.notificationsRestService) {
      throw new Error('notificationsRestService not set');
    }
    return this.notificationsRestService;
  }

  updateHeaders(headers: Record<string, string>) {
    this.webhookRestService.defaultHeaders = new HttpHeaders(headers);
    this.filesRestService.defaultHeaders = new HttpHeaders(headers);
    this.timeRestService.defaultHeaders = new HttpHeaders(headers);
    this.ssoRestService.defaultHeaders = new HttpHeaders(headers);
  }

  webSocket<T>({
    path,
    eventName,
    options,
  }: {
    path: string;
    eventName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any;
  }) {
    const wss = new WebSocket(
      (this.restClientConfiguration.basePath || '')
        .replace('/api', '')
        .replace('http', 'ws') + path,
      options
    );
    return new Observable<{ data: T; event: string }>((observer) => {
      wss.addEventListener('open', () => {
        wss.addEventListener('message', ({ data }) => {
          observer.next(JSON.parse(data.toString()));
        });
        wss.addEventListener('error', (err) => {
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
}
