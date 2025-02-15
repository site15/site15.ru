import { Injectable } from '@angular/core';
import { WebhookRestService } from '@nestjs-mod-sso/app-angular-rest-sdk';
import { WebhookAuthService } from './webhook-auth.service';

@Injectable({ providedIn: 'root' })
export class WebhookEventsService {
  constructor(
    private readonly webhookAuthService: WebhookAuthService,
    private readonly webhookRestService: WebhookRestService
  ) {}

  findMany() {
    return this.webhookRestService.webhookControllerEvents(
      this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId
    );
  }
}
