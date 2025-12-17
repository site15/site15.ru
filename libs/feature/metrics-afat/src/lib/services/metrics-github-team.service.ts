import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubTeamMapperService } from './metrics-github-team-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubTeamMapperService: MetricsGithubTeamMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamsControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubTeamMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamsControllerFindMany(
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
        map(({ meta, metricsGithubTeams }) => ({
          meta,
          metricsGithubTeams: metricsGithubTeams.map((p) => this.metricsGithubTeamMapperService.toModel(p)),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamsControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubTeamMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubTeamsControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamsControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubTeamMapperService.toModel(p)));
  }
}
