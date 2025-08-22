import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import {
  CreateMetricsGithubRepositoryDtoInterface,
  Site15RestSdkAngularService,
  UpdateMetricsGithubRepositoryDtoInterface,
} from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubRepositoryMapperService } from './metrics-github-repository-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubRepositoryService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubRepositoryMapperService: MetricsGithubRepositoryMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubRepositoryMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryControllerFindMany(
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
      .metricsGithubRepositoryControllerUpdateOne(id, data)
      .pipe(map((p) => this.metricsGithubRepositoryMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubRepositoryControllerDeleteOne(id);
  }

  createOne(data: CreateMetricsGithubRepositoryDtoInterface) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubRepositoryControllerCreateOne(data)
      .pipe(map((p) => this.metricsGithubRepositoryMapperService.toModel(p)));
  }
}
