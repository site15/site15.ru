import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubTeamRepositoryMapperService } from './metrics-github-team-repository-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamRepositoryService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubTeamRepositoryMapperService: MetricsGithubTeamRepositoryMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamRepositoriesControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubTeamRepositoryMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamRepositoriesControllerFindMany(
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
        map(({ meta, metricsGithubTeamRepositories }) => ({
          meta,
          metricsGithubTeamRepositories: metricsGithubTeamRepositories.map((p) =>
            this.metricsGithubTeamRepositoryMapperService.toModel(p),
          ),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamRepositoriesControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubTeamRepositoryMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubTeamRepositoriesControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamRepositoriesControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubTeamRepositoryMapperService.toModel(p)));
  }
}
