import { Injectable } from '@angular/core';
import { RestSdkAngularService } from '@nestjs-mod/sso-rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class WebhookEventsService {
  constructor(private readonly restSdkAngularService: RestSdkAngularService) {}

  findMany() {
    return this.restSdkAngularService.getWebhookApi().webhookControllerEvents();
  }
}
