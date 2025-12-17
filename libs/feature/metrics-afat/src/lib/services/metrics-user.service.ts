import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsUserMapperService } from './metrics-user-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsUserService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsUserMapperService: MetricsUserMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsUsersControllerFindOne(id)
      .pipe(map((p) => this.metricsUserMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsUsersControllerFindMany(
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined,
        undefined, // tenantId - will be handled by the API
      )
      .pipe(
        map(({ meta, metricsUsers }) => ({
          meta,
          metricsUsers: metricsUsers.map((p) => this.metricsUserMapperService.toModel(p)),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsUsersControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsUserMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsUsersControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsUsersControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsUserMapperService.toModel(p)));
  }
}
