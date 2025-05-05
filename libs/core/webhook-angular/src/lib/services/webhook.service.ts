import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod-sso/common-angular';
import {
  CreateWebhookDtoInterface,
  RestSdkAngularService,
  UpdateWebhookDtoInterface,
  WebhookLogInterface,
} from '@nestjs-mod-sso/rest-sdk-angular';
import { map } from 'rxjs';
import { WebhookLogMapperService } from './webhook-log-mapper.service';
import { WebhookMapperService } from './webhook-mapper.service';
@Injectable({ providedIn: 'root' })
export class WebhookService {
  constructor(
    private readonly restSdkAngularService: RestSdkAngularService,
    private readonly webhookMapperService: WebhookMapperService,
    private readonly webhookLogMapperService: WebhookLogMapperService
  ) {}

  findOne(id: string) {
    return this.restSdkAngularService
      .getWebhookApi()
      .webhookControllerFindOne(id)
      .pipe(map((w) => this.webhookMapperService.toModel(w)));
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.restSdkAngularService
      .getWebhookApi()
      .webhookControllerFindMany(
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined
      )
      .pipe(
        map(({ meta, webhooks }) => ({
          meta,
          webhooks: webhooks.map((w) => this.webhookMapperService.toModel(w)),
        }))
      );
  }

  updateOne(id: string, data: UpdateWebhookDtoInterface) {
    return this.restSdkAngularService
      .getWebhookApi()
      .webhookControllerUpdateOne(id, data)
      .pipe(map((w) => this.webhookMapperService.toModel(w)));
  }

  deleteOne(id: string) {
    return this.restSdkAngularService
      .getWebhookApi()
      .webhookControllerDeleteOne(id);
  }

  createOne(data: CreateWebhookDtoInterface) {
    return this.restSdkAngularService
      .getWebhookApi()
      .webhookControllerCreateOne(data)
      .pipe(map((w) => this.webhookMapperService.toModel(w)));
  }

  testRequest(data: CreateWebhookDtoInterface) {
    return this.restSdkAngularService
      .getWebhookApi()
      .webhookControllerTestRequest(data)
      .pipe(
        map((result) =>
          this.webhookLogMapperService.toModel(result as WebhookLogInterface)
        )
      );
  }
}
