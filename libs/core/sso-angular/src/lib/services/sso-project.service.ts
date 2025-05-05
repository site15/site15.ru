import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod-sso/common-angular';
import {
  CreateSsoProjectDtoInterface,
  RestSdkAngularService,
  UpdateSsoProjectDtoInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { map } from 'rxjs';
import { SsoProjectMapperService } from './sso-project-mapper.service';
@Injectable({ providedIn: 'root' })
export class SsoProjectService {
  constructor(
    private readonly restSdkAngularService: RestSdkAngularService,
    private readonly ssoProjectMapperService: SsoProjectMapperService
  ) {}

  findOne(id: string) {
    return this.restSdkAngularService
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
    return this.restSdkAngularService
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
    return this.restSdkAngularService
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
    return this.restSdkAngularService
      .getSsoApi()
      .ssoProjectsControllerUpdateOne(id, data)
      .pipe(map((p) => this.ssoProjectMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.restSdkAngularService
      .getSsoApi()
      .ssoProjectsControllerDeleteOne(id);
  }

  createOne(data: CreateSsoProjectDtoInterface) {
    return this.restSdkAngularService
      .getSsoApi()
      .ssoProjectsControllerCreateOne(data)
      .pipe(map((p) => this.ssoProjectMapperService.toModel(p)));
  }
}
