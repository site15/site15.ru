import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import {
  MetricsSite15RestService,
  Site15RestClientConfiguration,
  SsoSite15RestService,
  TimeSite15RestService,
} from './generated';

@Injectable({ providedIn: 'root' })
export class Site15RestSdkAngularService {
  constructor(
    private readonly site15RestClientConfiguration: Site15RestClientConfiguration,
    private readonly timeSite15RestService: TimeSite15RestService,
    private readonly ssoSite15RestService: SsoSite15RestService,
    private readonly metricsSite15RestService: MetricsSite15RestService,
  ) {
    timeSite15RestService.configuration.withCredentials = true;
    ssoSite15RestService.configuration.withCredentials = true;
    metricsSite15RestService.configuration.withCredentials = true;
  }

  getTimeApi() {
    if (!this.timeSite15RestService) {
      throw new Error('timeRestService not set');
    }
    return this.timeSite15RestService;
  }

  getSsoApi() {
    if (!this.ssoSite15RestService) {
      throw new Error('ssoApi not set');
    }
    return this.ssoSite15RestService;
  }

  getMetricsApi() {
    if (!this.metricsSite15RestService) {
      throw new Error('MetricsApi not set');
    }
    return this.metricsSite15RestService;
  }

  updateHeaders(headers: Record<string, string>) {
    this.timeSite15RestService.defaultHeaders = new HttpHeaders(headers);
    this.ssoSite15RestService.defaultHeaders = new HttpHeaders(headers);
    this.metricsSite15RestService.defaultHeaders = new HttpHeaders(headers);
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
      (this.site15RestClientConfiguration.basePath || '').replace('/api', '').replace('http', 'ws') + path,
      options,
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
}
