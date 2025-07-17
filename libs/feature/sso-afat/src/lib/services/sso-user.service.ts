import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import {
  SendInvitationLinksArgsInterface,
  Site15RestSdkAngularService,
  UpdateSsoUserDtoInterface,
} from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { SsoUserMapperService } from './sso-user-mapper.service';

@Injectable({ providedIn: 'root' })
export class SsoUserService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly ssoUserMapperService: SsoUserMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoUsersControllerFindOne(id)
      .pipe(map((u) => this.ssoUserMapperService.toModel(u)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
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
        filters['tenantId'],
      )
      .pipe(
        map(({ meta, ssoUsers }) => ({
          meta,
          ssoUsers: ssoUsers.map((p) => this.ssoUserMapperService.toModel(p)),
        })),
      );
  }

  updateOne(id: string, data: UpdateSsoUserDtoInterface) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoUsersControllerUpdateOne(id, data)
      .pipe(map((p) => this.ssoUserMapperService.toModel(p)));
  }

  sendInvitationLinks(data: SendInvitationLinksArgsInterface) {
    return this.site15RestSdkAngularService.getSsoApi().ssoUsersControllerSendInvitationLinks(data);
  }
}
