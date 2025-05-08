import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod-sso/common-angular';
import { SsoRestSdkAngularService } from '@nestjs-mod/sso-rest-sdk-angular';
import { map } from 'rxjs';
import { WebhookLogMapperService } from './webhook-log-mapper.service';

@Injectable({ providedIn: 'root' })
export class WebhookLogService {
  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
    private readonly webhookLogMapperService: WebhookLogMapperService
  ) {}

  findOne(id: string) {
    return this.ssoRestSdkAngularService
      .getWebhookApi()
      .webhookLogsControllerFindOne(id)
      .pipe(map((w) => this.webhookLogMapperService.toModel(w)));
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.ssoRestSdkAngularService
      .getWebhookApi()
      .webhookLogsControllerFindManyLogs(
        filters['webhookId'],
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined
      );
  }

  deleteOne(id: string) {
    return this.ssoRestSdkAngularService
      .getWebhookApi()
      .webhookLogsControllerDeleteOne(id);
  }
}
