import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubUserStatisticsMapperService } from './metrics-github-user-statistics-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubUserStatisticsService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubUserStatisticsMapperService: MetricsGithubUserStatisticsMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserStatisticsControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubUserStatisticsMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserStatisticsControllerFindMany(
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined,
        undefined, // tenantId
        filters['userId'],
      )
      .pipe(
        map(({ meta, metricsGithubUserStatistics }) => ({
          meta,
          metricsGithubUserStatistics: metricsGithubUserStatistics.map((p) =>
            this.metricsGithubUserStatisticsMapperService.toModel(p),
          ),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserStatisticsControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubUserStatisticsMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubUserStatisticsControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserStatisticsControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubUserStatisticsMapperService.toModel(p)));
  }
}
