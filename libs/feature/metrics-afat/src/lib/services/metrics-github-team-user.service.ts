import { Injectable } from '@angular/core';
import { RequestMeta } from '@nestjs-mod/misc';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { map } from 'rxjs';
import { MetricsGithubTeamUserMapperService } from './metrics-github-team-user-mapper.service';

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamUserService {
  constructor(
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly metricsGithubTeamUserMapperService: MetricsGithubTeamUserMapperService,
  ) {}

  findOne(id: string) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamUsersControllerFindOne(id)
      .pipe(map((p) => this.metricsGithubTeamUserMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamUsersControllerFindMany(
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
        map(({ meta, metricsGithubTeamUsers }) => ({
          meta,
          metricsGithubTeamUsers: metricsGithubTeamUsers.map((p) => this.metricsGithubTeamUserMapperService.toModel(p)),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamUsersControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.metricsGithubTeamUserMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.site15RestSdkAngularService.getMetricsApi().metricsGithubTeamUsersControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.site15RestSdkAngularService
      .getMetricsApi()
      .metricsGithubTeamUsersControllerCreateOne(data as any)
      .pipe(map((p) => this.metricsGithubTeamUserMapperService.toModel(p)));
  }
}
