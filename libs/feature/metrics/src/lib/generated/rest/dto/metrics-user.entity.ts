import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubMetric } from './metrics-github-metric.entity';
import { MetricsGithubRepository } from './metrics-github-repository.entity';
import { MetricsGithubUser } from './metrics-github-user.entity';
import { MetricsGithubUserRepository } from './metrics-github-user-repository.entity';

export class MetricsUser {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  tenantId!: string;
  @ApiProperty({
    type: 'string',
  })
  externalUserId!: string;
  @ApiProperty({
    enum: MetricsRole,
    enumName: 'MetricsRole',
  })
  userRole!: MetricsRole;
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
    type: () => MetricsGithubMetric,
    isArray: true,
    required: false,
  })
  MetricsGithubMetric_MetricsGithubMetric_createdByToMetricsUser?: MetricsGithubMetric[];
  @ApiProperty({
    type: () => MetricsGithubMetric,
    isArray: true,
    required: false,
  })
  MetricsGithubMetric_MetricsGithubMetric_updatedByToMetricsUser?: MetricsGithubMetric[];
  @ApiProperty({
    type: () => MetricsGithubRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubRepository_MetricsGithubRepository_createdByToMetricsUser?: MetricsGithubRepository[];
  @ApiProperty({
    type: () => MetricsGithubRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubRepository_MetricsGithubRepository_updatedByToMetricsUser?: MetricsGithubRepository[];
  @ApiProperty({
    type: () => MetricsGithubUser,
    isArray: true,
    required: false,
  })
  MetricsGithubUser_MetricsGithubUser_createdByToMetricsUser?: MetricsGithubUser[];
  @ApiProperty({
    type: () => MetricsGithubUser,
    isArray: true,
    required: false,
  })
  MetricsGithubUser_MetricsGithubUser_updatedByToMetricsUser?: MetricsGithubUser[];
  @ApiProperty({
    type: () => MetricsGithubUserRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubUserRepository_MetricsGithubUserRepository_createdByToMetricsUser?: MetricsGithubUserRepository[];
  @ApiProperty({
    type: () => MetricsGithubUserRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubUserRepository_MetricsGithubUserRepository_updatedByToMetricsUser?: MetricsGithubUserRepository[];
}
