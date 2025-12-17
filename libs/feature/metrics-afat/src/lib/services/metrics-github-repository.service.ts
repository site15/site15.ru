import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import {
  Site15RestSdkAngularService,
  UpdateMetricsGithubRepositoryDtoInterface,
  CreateMetricsGithubRepositoryDtoInterface,
} from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubRepositoryMapperService } from './metrics-github-repository-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubRepositoryService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubRepositoryMapperService: MetricsGithubRepositoryMapperService,
  ) {}

  sync(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryStatisticsControllerSyncRepositoryStatistics(id);
  }

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoriesControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubRepositoryMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoriesControllerFindMany(
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
        map(({ meta, metricsGithubRepositories }) => ({
          meta,
          metricsGithubRepositories: metricsGithubRepositories.map((p) =>
            this.metricsGithubRepositoryMapperService.toModel(p),
          ),
        })),
      );
  }

  updateOne(id: string, data: UpdateMetricsGithubRepositoryDtoInterface) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoriesControllerUpdateOne(id, data)
      .pipe(map((p) => this.metricsGithubRepositoryMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubRepositoriesControllerDeleteOne(id);
  }

  createOne(data: CreateMetricsGithubRepositoryDtoInterface) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoriesControllerCreateOne(data)
      .pipe(map((p) => this.metricsGithubRepositoryMapperService.toModel(p)));
  }
}
