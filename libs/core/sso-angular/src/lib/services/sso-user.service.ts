import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import {
  SendInvitationLinksArgsInterface,
  SsoRestSdkAngularService,
  UpdateSsoUserDtoInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { map } from 'rxjs';
import { SsoUserMapperService } from './sso-user-mapper.service';

@Injectable({ providedIn: 'root' })
export class SsoUserService {
  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
    private readonly ssoUserMapperService: SsoUserMapperService
  ) {}

  findOne(id: string) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
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
    return this.ssoRestSdkAngularService
      .getSsoApi()
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
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoUsersControllerUpdateOne(id, data)
      .pipe(map((p) => this.ssoUserMapperService.toModel(p)));
  }

  sendInvitationLinks(data: SendInvitationLinksArgsInterface) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoUsersControllerSendInvitationLinks(data);
  }
}
