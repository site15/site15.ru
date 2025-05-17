import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import {
  FilesSsoRestService,
  NotificationsSsoRestService,
  SsoRestClientConfiguration,
  SsoSsoRestService,
  TimeSsoRestService,
  WebhookSsoRestService,
} from './generated';

@Injectable({ providedIn: 'root' })
export class SsoRestSdkAngularService {
  constructor(
    private readonly ssoRestClientConfiguration: SsoRestClientConfiguration,
    private readonly webhookSsoRestService: WebhookSsoRestService,
    private readonly timeSsoRestService: TimeSsoRestService,
    private readonly filesSsoRestService: FilesSsoRestService,
    private readonly ssoSsoRestService: SsoSsoRestService,
    private readonly notificationsSsoRestService: NotificationsSsoRestService
  ) {
    ssoSsoRestService.configuration.withCredentials = true;
  }

  getWebhookApi() {
    if (!this.webhookSsoRestService) {
      throw new Error('webhookRestService not set');
    }
    return this.webhookSsoRestService;
  }

  getFilesApi() {
    if (!this.filesSsoRestService) {
      throw new Error('filesRestService not set');
    }
    return this.filesSsoRestService;
  }

  getTimeApi() {
    if (!this.timeSsoRestService) {
      throw new Error('timeRestService not set');
    }
    return this.timeSsoRestService;
  }

  getSsoApi() {
    if (!this.ssoSsoRestService) {
      throw new Error('ssoApi not set');
    }
    return this.ssoSsoRestService;
  }

  getNotificationsApi() {
    if (!this.notificationsSsoRestService) {
      throw new Error('notificationsRestService not set');
    }
    return this.notificationsSsoRestService;
  }

  updateHeaders(headers: Record<string, string>) {
    this.webhookSsoRestService.defaultHeaders = new HttpHeaders(headers);
    this.filesSsoRestService.defaultHeaders = new HttpHeaders(headers);
    this.timeSsoRestService.defaultHeaders = new HttpHeaders(headers);
    this.ssoSsoRestService.defaultHeaders = new HttpHeaders(headers);
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
      (this.ssoRestClientConfiguration.basePath || '')
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
