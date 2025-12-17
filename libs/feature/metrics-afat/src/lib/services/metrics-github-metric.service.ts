import { Injectable } from '@angular/core';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubMetricMapperService } from './metrics-github-metric-mapper.service';
import { RequestMeta } from '@nestjs-mod/misc';

@Injectable({ providedIn: 'root' })
export class MetricsGithubMetricService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubMetricMapperService: MetricsGithubMetricMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubMetricsControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubMetricMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubMetricsControllerFindMany(
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined,
        undefined, // tenantId
        filters['repositoryId'],
      )
      .pipe(
        map(({ meta, metricsGithubMetrics }) => ({
          meta,
          metricsGithubMetrics: metricsGithubMetrics.map((p) => this.metricsGithubMetricMapperService.toModel(p)),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubMetricsControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubMetricMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubMetricsControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubMetricsControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubMetricMapperService.toModel(p)));
  }
}
