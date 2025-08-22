import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubRepositoryStatisticsDto } from '../generated/rest/dto/metrics-github-repository-statistics.dto';

export class FindManyMetricsGithubRepositoryStatisticsResponse {
  @ApiProperty({
    type: MetricsGithubRepositoryStatisticsDto,
    isArray: true,
  })
  metricsGithubRepositoryStatistics!: MetricsGithubRepositoryStatisticsDto[];

  @ApiProperty({
    type: FindManyResponseMeta,
  })
  meta!: FindManyResponseMeta;
}
