import { Injectable } from '@angular/core';
import {
  SsoRestService,
  UpdateSsoEmailTemplateDtoInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-sso/common-angular';
import { map } from 'rxjs';
import { SsoEmailTemplateMapperService } from './sso-email-template-mapper.service';

@Injectable({ providedIn: 'root' })
export class SsoEmailTemplateService {
  constructor(
    private readonly ssoRestService: SsoRestService,
    private readonly ssoEmailTemplateMapperService: SsoEmailTemplateMapperService
  ) {}

  findOne(id: string) {
    return this.ssoRestService
      .ssoEmailTemplatesControllerFindOne(id)
      .pipe(map((t) => this.ssoEmailTemplateMapperService.toModel(t)));
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.ssoRestService
      .ssoEmailTemplatesControllerFindMany(
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
        map(({ meta, ssoEmailTemplates }) => ({
          meta,
          ssoEmailTemplates: ssoEmailTemplates.map((t) =>
            this.ssoEmailTemplateMapperService.toModel(t)
          ),
        }))
      );
  }

  updateOne(id: string, data: UpdateSsoEmailTemplateDtoInterface) {
    return this.ssoRestService
      .ssoEmailTemplatesControllerUpdateOne(id, data)
      .pipe(map((t) => this.ssoEmailTemplateMapperService.toModel(t)));
  }
}
