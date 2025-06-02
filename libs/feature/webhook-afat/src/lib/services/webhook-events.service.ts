import { Injectable } from '@angular/core';
import { SsoRestSdkAngularService } from '@nestjs-mod/sso-rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class WebhookEventsService {
  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService
  ) {}

  findMany() {
    return this.ssoRestSdkAngularService
      .getWebhookApi()
      .webhookControllerEvents();
  }
}
