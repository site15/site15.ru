import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import {
  CreateSsoTenantDtoInterface,
  SsoRestSdkAngularService,
  UpdateSsoTenantDtoInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { map } from 'rxjs';
import { SsoTenantMapperService } from './sso-tenant-mapper.service';
@Injectable({ providedIn: 'root' })
export class SsoTenantService {
  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
    private readonly ssoTenantMapperService: SsoTenantMapperService,
  ) {}

  findOne(id: string) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoTenantsControllerFindOne(id)
      .pipe(map((p) => this.ssoTenantMapperService.toModel(p)));
  }

  findManyPublic({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoPublicTenantsControllerFindMany(
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
        map(({ meta, ssoPublicTenants }) => ({
          meta,
          ssoPublicTenants: ssoPublicTenants.map((p) => this.ssoTenantMapperService.toPublicModel(p)),
        })),
      );
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoTenantsControllerFindMany(
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
        map(({ meta, ssoTenants }) => ({
          meta,
          ssoTenants: ssoTenants.map((p) => this.ssoTenantMapperService.toModel(p)),
        })),
      );
  }

  updateOne(id: string, data: UpdateSsoTenantDtoInterface) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoTenantsControllerUpdateOne(id, data)
      .pipe(map((p) => this.ssoTenantMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.ssoRestSdkAngularService.getSsoApi().ssoTenantsControllerDeleteOne(id);
  }

  createOne(data: CreateSsoTenantDtoInterface) {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoTenantsControllerCreateOne(data)
      .pipe(map((p) => this.ssoTenantMapperService.toModel(p)));
  }
}
