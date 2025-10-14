import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubRepositoryStatisticsMapperService } from './metrics-github-repository-statistics-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubRepositoryStatisticsService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubRepositoryStatisticsMapperService: MetricsGithubRepositoryStatisticsMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryStatisticsControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubRepositoryStatisticsMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryStatisticsControllerFindMany(
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
        map(({ meta, metricsGithubRepositoryStatistics }) => ({
          meta,
          metricsGithubRepositoryStatistics: metricsGithubRepositoryStatistics.map((p) =>
            this.metricsGithubRepositoryStatisticsMapperService.toModel(p),
          ),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryStatisticsControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubRepositoryStatisticsMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubRepositoryStatisticsControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryStatisticsControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubRepositoryStatisticsMapperService.toModel(p)));
  }
}
