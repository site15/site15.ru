import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubMetric } from './metrics-github-metric.entity';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubRepositoryStatistics } from './metrics-github-repository-statistics.entity';
import { MetricsGithubTeamRepository } from './metrics-github-team-repository.entity';
import { MetricsGithubUserRepository } from './metrics-github-user-repository.entity';

export class MetricsGithubRepository {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  name!: string;
  @ApiProperty({
    type: 'string',
  })
  owner!: string;
  @ApiProperty({
    type: 'boolean',
  })
  private!: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  fork!: boolean;
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
    type: 'string',
    nullable: true,
  })
  description!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  url!: string | null;
  @ApiProperty({
    type: () => MetricsGithubMetric,
    isArray: true,
    required: false,
  })
  MetricsGithubMetric?: MetricsGithubMetric[];
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubRepository_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubRepository_updatedByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubRepositoryStatistics,
    isArray: true,
    required: false,
  })
  MetricsGithubRepositoryStatistics?: MetricsGithubRepositoryStatistics[];
  @ApiProperty({
    type: () => MetricsGithubTeamRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamRepository?: MetricsGithubTeamRepository[];
  @ApiProperty({
    type: () => MetricsGithubUserRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubUserRepository?: MetricsGithubUserRepository[];
}
