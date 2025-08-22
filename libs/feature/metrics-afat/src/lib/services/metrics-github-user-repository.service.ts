import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubUserRepositoryMapperService } from './metrics-github-user-repository-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubUserRepositoryService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubUserRepositoryMapperService: MetricsGithubUserRepositoryMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserRepositoryControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubUserRepositoryMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserRepositoryControllerFindMany(
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
        map(({ meta, metricsGithubUserRepositories }) => ({
          meta,
          metricsGithubUserRepositories: metricsGithubUserRepositories.map((p) =>
            this.metricsGithubUserRepositoryMapperService.toModel(p),
          ),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserRepositoryControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubUserRepositoryMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubUserRepositoryControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubUserRepositoryControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubUserRepositoryMapperService.toModel(p)));
  }
}
