import { Injectable } from '@angular/core';
import {
  SendInvitationLinksArgsInterface,
  SsoRestService,
  UpdateSsoUserDtoInterface,
} from '@nestjs-mod-sso/rest-sdk-angular';
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
      .pipe(map((u) => this.ssoUserMapperService.toModel(u)));
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
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined,
        filters['projectId']
      )
      .pipe(
        map(({ meta, ssoUsers }) => ({
          meta,
          ssoUsers: ssoUsers.map((p) => this.ssoUserMapperService.toModel(p)),
        }))
      );
  }

  updateOne(id: string, data: UpdateSsoUserDtoInterface) {
    return this.ssoRestService
      .ssoUsersControllerUpdateOne(id, data)
      .pipe(map((p) => this.ssoUserMapperService.toModel(p)));
  }

  sendInvitationLinks(data: SendInvitationLinksArgsInterface) {
    return this.ssoRestService.ssoUsersControllerSendInvitationLinks(data);
  }
}
