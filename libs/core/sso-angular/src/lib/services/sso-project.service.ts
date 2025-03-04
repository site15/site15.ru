import { Injectable } from '@angular/core';
import {
  CreateSsoProjectDtoInterface,
  SsoRestService,
  UpdateSsoProjectDtoInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-sso/common-angular';
import { map } from 'rxjs';
import { SsoProjectMapperService } from './sso-project-mapper.service';
@Injectable({ providedIn: 'root' })
export class SsoProjectService {
  constructor(
    private readonly ssoRestService: SsoRestService,
    private readonly ssoProjectMapperService: SsoProjectMapperService
  ) {}

  findOne(id: string) {
    return this.ssoRestService
      .ssoProjectsControllerFindOne(id)
      .pipe(map(this.ssoProjectMapperService.toModel));
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.ssoRestService
      .ssoProjectsControllerFindMany(
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
        map(({ meta, ssoProjects }) => ({
          meta,
          ssoProjects: ssoProjects.map(this.ssoProjectMapperService.toModel),
        }))
      );
  }

  updateOne(id: string, data: UpdateSsoProjectDtoInterface) {
    return this.ssoRestService
      .ssoProjectsControllerUpdateOne(id, data)
      .pipe(map(this.ssoProjectMapperService.toModel));
  }

  deleteOne(id: string) {
    return this.ssoRestService.ssoProjectsControllerDeleteOne(id);
  }

  createOne(data: CreateSsoProjectDtoInterface) {
    return this.ssoRestService
      .ssoProjectsControllerCreateOne(data)
      .pipe(map(this.ssoProjectMapperService.toModel));
  }
}
