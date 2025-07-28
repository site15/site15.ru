import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubRepository } from './metrics-github-repository.entity';

export class MetricsGithubMetric {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  repositoryId!: string;
  @ApiProperty({
    type: 'string',
  })
  metricName!: string;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  metricValue!: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  recordedAt!: Date;
  @ApiProperty({
    type: 'string',
  })
  createdBy!: string;
  @ApiProperty({
    type: 'string',
  })
  updatedBy!: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
  @ApiProperty({
    type: 'string',
  })
  tenantId!: string;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubMetric_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubRepository,
    required: false,
  })
  MetricsGithubRepository?: MetricsGithubRepository;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubMetric_updatedByToMetricsUser?: MetricsUser;
}
