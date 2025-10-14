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
      .metricsGithubTeamControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubTeamMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamControllerFindMany(
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
      .metricsGithubTeamControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubTeamMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubTeamControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubTeamMapperService.toModel(p)));
  }
}
