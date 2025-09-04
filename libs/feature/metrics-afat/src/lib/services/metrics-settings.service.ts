import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsSettingsMapperService } from './metrics-settings-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsSettingsService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsSettingsMapperService: MetricsSettingsMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsSettingsControllerFindOne(id)
      .pipe(map((p) => this.metricsSettingsMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsSettingsControllerFindMany(
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
        map(({ meta, metricsSettings }) => ({
          meta,
          metricsSettings: metricsSettings.map((p) => this.metricsSettingsMapperService.toModel(p)),
        })),
      );
  }

  findCurrent() {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsSettingsControllerFindCurrent()
      .pipe(map((p) => this.metricsSettingsMapperService.toModel(p)));
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsSettingsControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsSettingsMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsSettingsControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsSettingsControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsSettingsMapperService.toModel(p)));
  }
}
