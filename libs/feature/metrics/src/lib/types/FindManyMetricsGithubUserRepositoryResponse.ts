import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubUserRepository } from '../generated/rest/dto/metrics-github-user-repository.entity';

export class FindManyMetricsGithubUserRepositoryResponse {
  @ApiProperty({ type: () => [MetricsGithubUserRepository] })
  metricsGithubUserRepositories!: MetricsGithubUserRepository[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
