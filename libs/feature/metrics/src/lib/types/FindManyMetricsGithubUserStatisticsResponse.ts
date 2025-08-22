import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubUserStatisticsDto } from '../generated/rest/dto/metrics-github-user-statistics.dto';

export class FindManyMetricsGithubUserStatisticsResponse {
  @ApiProperty({
    type: MetricsGithubUserStatisticsDto,
    isArray: true,
  })
  metricsGithubUserStatistics!: MetricsGithubUserStatisticsDto[];

  @ApiProperty({
    type: FindManyResponseMeta,
  })
  meta!: FindManyResponseMeta;
}
