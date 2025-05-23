import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import {
  CreateSsoProjectDtoInterface,
  SsoRestSdkAngularService,
  UpdateSsoProjectDtoInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { map } from 'rxjs';
import { SsoProjectMapperService } from './sso-project-mapper.service';
@Injectable({ providedIn: 'root' })
export class SsoProjectService {
  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
    private readonly ssoProjectMapperService: SsoProjectMapperService
  ) {}

  findOne(id: string) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoProjectsControllerFindOne(id)
      .pipe(map((p) => this.ssoProjectMapperService.toModel(p)));
  }

  findManyPublic({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoPublicProjectsControllerFindMany(
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
        map(({ meta, ssoPublicProjects }) => ({
          meta,
          ssoPublicProjects: ssoPublicProjects.map((p) =>
            this.ssoProjectMapperService.toPublicModel(p)
          ),
        }))
      );
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
          ssoProjects: ssoProjects.map((p) =>
            this.ssoProjectMapperService.toModel(p)
          ),
        }))
      );
  }

  updateOne(id: string, data: UpdateSsoProjectDtoInterface) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoProjectsControllerUpdateOne(id, data)
      .pipe(map((p) => this.ssoProjectMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoProjectsControllerDeleteOne(id);
  }

  createOne(data: CreateSsoProjectDtoInterface) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoProjectsControllerCreateOne(data)
      .pipe(map((p) => this.ssoProjectMapperService.toModel(p)));
  }
}
