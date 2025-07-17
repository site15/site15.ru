import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService, UpdateSsoRefreshSessionDtoInterface } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { SsoSessionMapperService } from './sso-session-mapper.service';

@Injectable({ providedIn: 'root' })
export class SsoSessionService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly ssoSessionMapperService: SsoSessionMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoRefreshSessionsControllerFindOne(id)
      .pipe(map((s) => this.ssoSessionMapperService.toModel(s)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoRefreshSessionsControllerFindMany(
        filters['userId'],
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined,
      )
      .pipe(
        map(({ meta, ssoRefreshSessions }) => ({
          meta,
          ssoRefreshSessions: ssoRefreshSessions.map((t) => this.ssoSessionMapperService.toModel(t)),
        })),
      );
  }

  updateOne(id: string, data: UpdateSsoRefreshSessionDtoInterface) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoRefreshSessionsControllerUpdateOne(id, data)
      .pipe(map((s) => this.ssoSessionMapperService.toModel(s)));
  }
}
