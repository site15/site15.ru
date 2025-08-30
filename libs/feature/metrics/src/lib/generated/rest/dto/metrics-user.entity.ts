import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubMetric } from './metrics-github-metric.entity';
import { MetricsGithubRepository } from './metrics-github-repository.entity';
import { MetricsGithubRepositoryStatistics } from './metrics-github-repository-statistics.entity';
import { MetricsGithubTeam } from './metrics-github-team.entity';
import { MetricsGithubTeamRepository } from './metrics-github-team-repository.entity';
import { MetricsGithubTeamUser } from './metrics-github-team-user.entity';
import { MetricsGithubUser } from './metrics-github-user.entity';
import { MetricsGithubUserRepository } from './metrics-github-user-repository.entity';
import { MetricsGithubUserStatistics } from './metrics-github-user-statistics.entity';

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
    type: 'boolean',
  })
  botForDataSync!: boolean;
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
    type: () => MetricsGithubRepositoryStatistics,
    isArray: true,
    required: false,
  })
  MetricsGithubRepositoryStatistics_MetricsGithubRepositoryStatistics_createdByToMetricsUser?: MetricsGithubRepositoryStatistics[];
  @ApiProperty({
    type: () => MetricsGithubRepositoryStatistics,
    isArray: true,
    required: false,
  })
  MetricsGithubRepositoryStatistics_MetricsGithubRepositoryStatistics_updatedByToMetricsUser?: MetricsGithubRepositoryStatistics[];
  @ApiProperty({
    type: () => MetricsGithubTeam,
    isArray: true,
    required: false,
  })
  MetricsGithubTeam_MetricsGithubTeam_createdByToMetricsUser?: MetricsGithubTeam[];
  @ApiProperty({
    type: () => MetricsGithubTeam,
    isArray: true,
    required: false,
  })
  MetricsGithubTeam_MetricsGithubTeam_updatedByToMetricsUser?: MetricsGithubTeam[];
  @ApiProperty({
    type: () => MetricsGithubTeamRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamRepository_MetricsGithubTeamRepository_createdByToMetricsUser?: MetricsGithubTeamRepository[];
  @ApiProperty({
    type: () => MetricsGithubTeamRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamRepository_MetricsGithubTeamRepository_updatedByToMetricsUser?: MetricsGithubTeamRepository[];
  @ApiProperty({
    type: () => MetricsGithubTeamUser,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamUser_MetricsGithubTeamUser_createdByToMetricsUser?: MetricsGithubTeamUser[];
  @ApiProperty({
    type: () => MetricsGithubTeamUser,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamUser_MetricsGithubTeamUser_updatedByToMetricsUser?: MetricsGithubTeamUser[];
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
  @ApiProperty({
    type: () => MetricsGithubUserStatistics,
    isArray: true,
    required: false,
  })
  MetricsGithubUserStatistics_MetricsGithubUserStatistics_createdByToMetricsUser?: MetricsGithubUserStatistics[];
  @ApiProperty({
    type: () => MetricsGithubUserStatistics,
    isArray: true,
    required: false,
  })
  MetricsGithubUserStatistics_MetricsGithubUserStatistics_updatedByToMetricsUser?: MetricsGithubUserStatistics[];
}
