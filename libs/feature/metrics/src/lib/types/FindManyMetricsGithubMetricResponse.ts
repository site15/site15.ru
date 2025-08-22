import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubMetric } from '../generated/rest/dto/metrics-github-metric.entity';

export class FindManyMetricsGithubMetricResponse {
  @ApiProperty({ type: () => [MetricsGithubMetric] })
  metricsGithubMetrics!: MetricsGithubMetric[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
