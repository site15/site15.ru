import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ReplaySubject } from 'rxjs';
import { TwoFactorEventContext } from './two-factor-types';

@Injectable()
export class TwoFactorEventsService {
  private logger = new Logger(TwoFactorEventsService.name);
  private twoFactorEventStream$ = new ReplaySubject<
    Partial<TwoFactorEventContext>
  >();

  private id = randomUUID();

  async send(event: Partial<TwoFactorEventContext>) {
    if (event.serviceId !== this.id) {
      event.serviceId = this.id;
      this.logger.debug(`send: ${JSON.stringify(event)}`);
      this.twoFactorEventStream$.next(event);
    }
  }

  listen() {
    this.logger.debug(`listen...`);
    return this.twoFactorEventStream$;
  }
}
