import { Injectable } from '@angular/core';
import { WebhookRestService } from '@nestjs-mod-sso/rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class WebhookEventsService {
  constructor(private readonly webhookRestService: WebhookRestService) {}

  findMany() {
    return this.webhookRestService.webhookControllerEvents();
  }
}
