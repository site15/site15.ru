import { Injectable } from '@angular/core';
import {
  SsoRestService,
  UpdateSsoUserDtoInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-sso/common-angular';
import { map } from 'rxjs';
import { SsoUserMapperService } from './sso-user-mapper.service';

@Injectable({ providedIn: 'root' })
export class SsoUserService {
  constructor(
    private readonly ssoRestService: SsoRestService,
    private readonly ssoUserMapperService: SsoUserMapperService
  ) {}

  findOne(id: string) {
    return this.ssoRestService
      .ssoUsersControllerFindOne(id)
      .pipe(map(this.ssoUserMapperService.toModel));
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.ssoRestService
      .ssoUsersControllerFindMany(
        filters['projectId'],
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
        map(({ meta, ssoUsers }) => ({
          meta,
          ssoUsers: ssoUsers.map(this.ssoUserMapperService.toModel),
        }))
      );
  }

  updateOne(id: string, data: UpdateSsoUserDtoInterface) {
    return this.ssoRestService
      .ssoUsersControllerUpdateOne(id, data)
      .pipe(map(this.ssoUserMapperService.toModel));
  }
}
