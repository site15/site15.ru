import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ReplaySubject } from 'rxjs';
import { SsoEventContext } from '../types/auth-event';

@Injectable()
export class SsoEventsService {
  private logger = new Logger(SsoEventsService.name);
  private ssoEventStream$ = new ReplaySubject<Partial<SsoEventContext>>();

  private id = randomUUID();

  async send(event: Partial<SsoEventContext>) {
    if (event.serviceId !== this.id) {
      this.logger.debug(`sendToSsoEventStream: ${JSON.stringify(event)}`);
      this.ssoEventStream$.next(event);
    }
  }

  listen() {
    return this.ssoEventStream$;
  }
}
