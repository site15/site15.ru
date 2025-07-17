import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import {
  CreateSsoTenantDtoInterface,
  Site15RestSdkAngularService,
  UpdateSsoTenantDtoInterface,
} from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { SsoTenantMapperService } from './sso-tenant-mapper.service';
@Injectable({ providedIn: 'root' })
export class SsoTenantService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly ssoTenantMapperService: SsoTenantMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoTenantsControllerFindOne(id)
      .pipe(map((p) => this.ssoTenantMapperService.toModel(p)));
  }

  findManyPublic({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
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
    return this.site15RestSdkAngularService
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
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoTenantsControllerUpdateOne(id, data)
      .pipe(map((p) => this.ssoTenantMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getSsoApi().ssoTenantsControllerDeleteOne(id);
  }

  createOne(data: CreateSsoTenantDtoInterface) {
    return this.site15RestSdkAngularService
      .getSsoApi()
      .ssoTenantsControllerCreateOne(data)
      .pipe(map((p) => this.ssoTenantMapperService.toModel(p)));
  }
}
