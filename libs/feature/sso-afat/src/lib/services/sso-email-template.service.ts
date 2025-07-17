import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService, UpdateSsoEmailTemplateDtoInterface } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { SsoEmailTemplateMapperService } from './sso-email-template-mapper.service';

@Injectable({ providedIn: 'root' })
export class SsoEmailTemplateService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly ssoEmailTemplateMapperService: SsoEmailTemplateMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoEmailTemplatesControllerFindOne(id)
      .pipe(map((t) => this.ssoEmailTemplateMapperService.toModel(t)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoEmailTemplatesControllerFindMany(
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined,
        filters['tenantId'],
      )
      .pipe(
        map(({ meta, ssoEmailTemplates }) => ({
          meta,
          ssoEmailTemplates: ssoEmailTemplates.map((t) => this.ssoEmailTemplateMapperService.toModel(t)),
        })),
      );
  }

  updateOne(id: string, data: UpdateSsoEmailTemplateDtoInterface) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoEmailTemplatesControllerUpdateOne(id, data)
      .pipe(map((t) => this.ssoEmailTemplateMapperService.toModel(t)));
  }
}
