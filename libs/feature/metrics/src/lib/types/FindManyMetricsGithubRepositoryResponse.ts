import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubRepository } from '../generated/rest/dto/metrics-github-repository.entity';

export class FindManyMetricsGithubRepositoryResponse {
  @ApiProperty({ type: () => [MetricsGithubRepository] })
  metricsGithubRepositories!: MetricsGithubRepository[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
