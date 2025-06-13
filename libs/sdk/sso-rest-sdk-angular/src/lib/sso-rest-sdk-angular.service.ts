import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import {
  SsoRestClientConfiguration,
  SsoSsoRestService,
  TimeSsoRestService,
} from './generated';

@Injectable({ providedIn: 'root' })
export class SsoRestSdkAngularService {
  constructor(
    private readonly ssoRestClientConfiguration: SsoRestClientConfiguration,
    private readonly timeSsoRestService: TimeSsoRestService,
    private readonly ssoSsoRestService: SsoSsoRestService
  ) {
    timeSsoRestService.configuration.withCredentials = true;
    ssoSsoRestService.configuration.withCredentials = true;
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

  updateHeaders(headers: Record<string, string>) {
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
