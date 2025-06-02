import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ReplaySubject } from 'rxjs';
import { SsoEventContext } from '../types/sso-event';

type SsoEventCallback = (event: Partial<SsoEventContext>) => Promise<void>;

@Injectable()
export class SsoEventsService {
  private logger = new Logger(SsoEventsService.name);
  private ssoEventStream$ = new ReplaySubject<Partial<SsoEventContext>>();
  private ssoEventCallbacks: SsoEventCallback[] = [];

  private id = randomUUID();

  async send(event: Partial<SsoEventContext>) {
    if (event.serviceId !== this.id) {
      event.serviceId = this.id;
      this.logger.debug(`send: ${JSON.stringify(event)}`);
      this.ssoEventStream$.next(event);
      for (const ssoEventCallback of this.ssoEventCallbacks) {
        await ssoEventCallback(event);
      }
    }
  }

  listen(ssoEventCallback?: SsoEventCallback) {
    if (ssoEventCallback) {
      this.logger.debug(`append new callback...`);
      this.ssoEventCallbacks.push(ssoEventCallback);
      return null;
    } else {
      this.logger.debug(`listen...`);
      return this.ssoEventStream$;
    }
  }
}
